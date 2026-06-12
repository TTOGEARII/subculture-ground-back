import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { TicketUser, TicketUserStatus } from './ticket-user.entity';
import { TicketInfo } from '../ticket-info/ticket-info.entity';
import { Performance } from '../performance/performance.entity';
import { KakaoService } from '../kakao/kakao.service';
import { CreateTicketUserDto } from './dto/create-ticket-user.dto';
import { UpdateTicketUserDto } from './dto/update-ticket-user.dto';

// 예매자 관리용 조인 응답
export interface ReservationRow {
  idx: number;
  ticketName: string | null;
  ticketType: number;
  ticketCnt: number;
  ticketTotalPrice: number;
  ticketStatus: TicketUserStatus;
  ticketChkDt: Date | null;
  createDt: Date | null;
  buyerName: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
}

// 마이페이지 내 예매 내역 (공연 정보 조인)
export interface MyReservationRow {
  idx: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  ticketName: string | null;
  ticketCnt: number;
  ticketTotalPrice: number;
  ticketStatus: TicketUserStatus;
  ticketChkDt: Date | null;
  createDt: Date | null;
}

@Injectable()
export class TicketUserService {
  private readonly logger = new Logger(TicketUserService.name);

  constructor(
    @InjectRepository(TicketUser)
    private ticketUserRepository: Repository<TicketUser>,
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
    private dataSource: DataSource,
    private kakaoService: KakaoService,
  ) {}

  /** 예매(ticket-user)가 속한 공연이 요청 유저 소유인지 검증하고 공연을 반환한다. */
  private async assertReservationOwnership(
    reservationIdx: number,
    userIdx: number,
  ): Promise<TicketUser> {
    const row = await this.ticketUserRepository.findOne({
      where: { idx: reservationIdx },
    });
    if (!row) throw new NotFoundException('예매 내역을 찾을 수 없습니다.');

    const ticketInfo = await this.dataSource
      .getRepository(TicketInfo)
      .findOne({ where: { idx: row.ticketIdx } });
    if (!ticketInfo) throw new NotFoundException('티켓 정보를 찾을 수 없습니다.');

    const performance = await this.performanceRepository.findOne({
      where: { idx: ticketInfo.pmIdx },
    });
    if (!performance) throw new NotFoundException('공연을 찾을 수 없습니다.');
    if (Number(performance.createUserIdx) !== Number(userIdx)) {
      throw new ForbiddenException('본인 공연의 예매만 관리할 수 있습니다.');
    }
    return row;
  }

  /** 공연별 예매자 목록 (구매자/티켓 정보 조인). 호스트 소유 검증 포함. */
  async findReservationsByPerformance(
    pmIdx: number,
    userIdx: number,
  ): Promise<ReservationRow[]> {
    const performance = await this.performanceRepository.findOne({
      where: { idx: pmIdx },
    });
    if (!performance) throw new NotFoundException('공연을 찾을 수 없습니다.');
    if (Number(performance.createUserIdx) !== Number(userIdx)) {
      throw new ForbiddenException('본인 공연의 예매만 조회할 수 있습니다.');
    }

    const rows = await this.ticketUserRepository
      .createQueryBuilder('tu')
      .innerJoin(TicketInfo, 'ti', 'ti.idx = tu.ticketIdx')
      .leftJoin('sb_member', 'm', 'm.idx = tu.userIdx')
      .where('ti.pm_idx = :pmIdx', { pmIdx })
      .andWhere('tu.deleteDt IS NULL')
      .orderBy('tu.idx', 'DESC')
      .select([
        'tu.idx AS idx',
        'ti.ticket_name AS ticketName',
        'ti.ticket_type AS ticketType',
        'tu.ticket_cnt AS ticketCnt',
        'tu.ticket_total_price AS ticketTotalPrice',
        'tu.ticket_status AS ticketStatus',
        'tu.ticket_chk_dt AS ticketChkDt',
        'tu.create_dt AS createDt',
        'm.sb_name AS buyerName',
        'm.sb_email AS buyerEmail',
        'm.sb_phone AS buyerPhone',
      ])
      .getRawMany<ReservationRow>();

    return rows.map((r) => ({
      ...r,
      idx: Number(r.idx),
      ticketType: Number(r.ticketType),
      ticketCnt: Number(r.ticketCnt),
      ticketTotalPrice: Number(r.ticketTotalPrice),
      ticketStatus: Number(r.ticketStatus) as TicketUserStatus,
    }));
  }

  /** 마이페이지 — 내 예매 내역 (공연 정보 조인). */
  async findMyReservations(userIdx: number): Promise<MyReservationRow[]> {
    const rows = await this.ticketUserRepository
      .createQueryBuilder('tu')
      .innerJoin(TicketInfo, 'ti', 'ti.idx = tu.ticketIdx')
      .innerJoin(Performance, 'p', 'p.idx = ti.pm_idx')
      .where('tu.user_idx = :userIdx', { userIdx })
      .andWhere('tu.deleteDt IS NULL')
      .orderBy('tu.idx', 'DESC')
      .select([
        'tu.idx AS idx',
        'p.idx AS eventId',
        'p.sb_performances_name AS eventName',
        'p.sb_performances_date AS eventDate',
        'p.sb_performances_time AS eventTime',
        'ti.ticket_name AS ticketName',
        'tu.ticket_cnt AS ticketCnt',
        'tu.ticket_total_price AS ticketTotalPrice',
        'tu.ticket_status AS ticketStatus',
        'tu.ticket_chk_dt AS ticketChkDt',
        'tu.create_dt AS createDt',
      ])
      .getRawMany<MyReservationRow>();

    return rows.map((r) => ({
      ...r,
      idx: Number(r.idx),
      eventId: Number(r.eventId),
      ticketCnt: Number(r.ticketCnt),
      ticketTotalPrice: Number(r.ticketTotalPrice),
      ticketStatus: Number(r.ticketStatus) as TicketUserStatus,
    }));
  }

  /** 예매 상태 변경 (승인/취소/체크인). 호스트 소유 검증 + 상태별 타임스탬프. */
  async changeStatus(
    reservationIdx: number,
    status: TicketUserStatus,
    userIdx: number,
  ): Promise<TicketUser> {
    const row = await this.assertReservationOwnership(reservationIdx, userIdx);
    const now = new Date();
    row.ticketStatus = status;
    if (status === 1) row.ticketPayCompleteDt = now; // 결제완료
    if (status === 2) row.ticketChkDt = now; // 체크인
    row.updateDt = now;
    await this.ticketUserRepository.save(row);
    this.logger.log(`예매 상태 변경: idx=${reservationIdx}, status=${status}`);

    // 승인(결제완료) 시 → 구매자에게 입장 QR 카카오톡 발송 (best-effort)
    if (status === 1) {
      this.notifyApprovalQr(row).catch((e) =>
        this.logger.warn(`승인 QR 발송 중 오류: ${e?.message ?? e}`),
      );
    }

    return row;
  }

  /** 예매 승인 시 입장 QR 카카오톡 발송 (구매자가 카카오 회원일 때만). */
  private async notifyApprovalQr(row: TicketUser): Promise<void> {
    const ticketInfo = await this.dataSource
      .getRepository(TicketInfo)
      .findOne({ where: { idx: row.ticketIdx } });
    if (!ticketInfo) return;
    const performance = await this.performanceRepository.findOne({
      where: { idx: ticketInfo.pmIdx },
    });
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    await this.kakaoService.sendApprovalQr(row.userIdx, {
      eventName: performance?.performanceName ?? '공연',
      ticketName: ticketInfo.ticketName ?? '티켓',
      count: row.ticketCnt,
      reservationIdx: row.idx,
      linkUrl: `${frontendUrl}/my-page`,
    });
  }

  async create(dto: CreateTicketUserDto): Promise<TicketUser> {
    const cnt = dto.ticketCnt ?? 1;

    const saved = await this.dataSource.transaction(async (manager) => {
      // 잔여 수량 확인 (비관적 잠금으로 동시 예매 방지)
      const ticketInfo = await manager.findOne(TicketInfo, {
        where: { idx: dto.ticketIdx },
        lock: { mode: 'pessimistic_write' },
      });

      if (!ticketInfo || ticketInfo.delFlag === 1) {
        throw new NotFoundException('티켓 정보를 찾을 수 없습니다.');
      }

      const remaining = ticketInfo.ticketMax - ticketInfo.ticketCount;
      if (remaining < cnt) {
        throw new BadRequestException(
          `잔여 수량이 부족합니다. (남은 수량: ${remaining}매)`,
        );
      }

      // ticketCount 증가
      ticketInfo.ticketCount += cnt;
      ticketInfo.updateDt = new Date();
      await manager.save(TicketInfo, ticketInfo);

      // 예매 내역 생성
      const entity = manager.create(TicketUser, {
        ticketIdx: dto.ticketIdx,
        userIdx: dto.userIdx,
        ticketCnt: cnt,
        ticketTotalPrice: dto.ticketTotalPrice ?? 0,
        ticketStatus: dto.ticketStatus ?? 0,
      });
      const saved = await manager.save(TicketUser, entity);
      this.logger.log(`티켓 예매 생성: idx=${saved.idx}, ticketIdx=${dto.ticketIdx}, cnt=${cnt}`);
      return saved;
    });

    // 예매 완료 → 카카오톡 알림 (best-effort: 실패해도 예매에는 영향 없음)
    this.notifyBooking(
      dto.userIdx,
      saved.idx,
      dto.ticketIdx,
      cnt,
      dto.ticketTotalPrice ?? 0,
    ).catch((e) =>
      this.logger.warn(`예매 알림 발송 중 오류: ${e?.message ?? e}`),
    );

    return saved;
  }

  /** 예매 완료 카카오톡 알림 발송 (구매자가 카카오 회원일 때만). */
  private async notifyBooking(
    userIdx: number,
    reservationIdx: number,
    ticketIdx: number,
    count: number,
    totalPrice: number,
  ): Promise<void> {
    const ticketInfo = await this.dataSource
      .getRepository(TicketInfo)
      .findOne({ where: { idx: ticketIdx } });
    if (!ticketInfo) return;
    const performance = await this.performanceRepository.findOne({
      where: { idx: ticketInfo.pmIdx },
    });
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    await this.kakaoService.sendBookingNotification(userIdx, {
      eventName: performance?.performanceName ?? '공연',
      ticketName: ticketInfo.ticketName ?? '티켓',
      count,
      totalPrice,
      linkUrl: `${frontendUrl}/my-page`,
      refType: 'ticket_user',
      refIdx: reservationIdx,
    });
  }

  async findAll(): Promise<TicketUser[]> {
    return this.ticketUserRepository.find({
      order: { idx: 'DESC' },
    });
  }

  async findByTicketIdx(ticketIdx: number): Promise<TicketUser[]> {
    return this.ticketUserRepository.find({
      where: { ticketIdx },
      order: { idx: 'DESC' },
    });
  }

  async findByUserIdx(userIdx: number): Promise<TicketUser[]> {
    return this.ticketUserRepository.find({
      where: { userIdx, deleteDt: IsNull() },
      order: { idx: 'DESC' },
    });
  }

  async findOne(idx: number): Promise<TicketUser> {
    const row = await this.ticketUserRepository.findOne({ where: { idx } });
    if (!row) {
      throw new NotFoundException(`티켓 유저 정보를 찾을 수 없습니다. (idx: ${idx})`);
    }
    return row;
  }

  async update(idx: number, dto: UpdateTicketUserDto): Promise<TicketUser> {
    const row = await this.findOne(idx);
    if (dto.ticketIdx !== undefined) row.ticketIdx = dto.ticketIdx;
    if (dto.userIdx !== undefined) row.userIdx = dto.userIdx;
    if (dto.ticketCnt !== undefined) row.ticketCnt = dto.ticketCnt;
    if (dto.ticketTotalPrice !== undefined) row.ticketTotalPrice = dto.ticketTotalPrice;
    if (dto.ticketStatus !== undefined) row.ticketStatus = dto.ticketStatus;
    if (dto.ticketChkDt !== undefined) row.ticketChkDt = dto.ticketChkDt;
    if (dto.ticketPayCompleteDt !== undefined) row.ticketPayCompleteDt = dto.ticketPayCompleteDt;

    row.updateDt = new Date();
    await this.ticketUserRepository.save(row);
    this.logger.log(`티켓 유저 수정: idx=${idx}`);
    return row;
  }

  async remove(idx: number): Promise<void> {
    const row = await this.findOne(idx);
    row.deleteDt = new Date();
    row.updateDt = new Date();
    await this.ticketUserRepository.save(row);
    this.logger.log(`티켓 유저 삭제(소프트): idx=${idx}`);
  }

  async hardDelete(idx: number): Promise<void> {
    const row = await this.findOne(idx);
    await this.ticketUserRepository.remove(row);
    this.logger.log(`티켓 유저 삭제(물리): idx=${idx}`);
  }
}
