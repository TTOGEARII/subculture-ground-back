import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { TicketUser } from './ticket-user.entity';
import { TicketInfo } from '../ticket-info/ticket-info.entity';
import { CreateTicketUserDto } from './dto/create-ticket-user.dto';
import { UpdateTicketUserDto } from './dto/update-ticket-user.dto';

@Injectable()
export class TicketUserService {
  private readonly logger = new Logger(TicketUserService.name);

  constructor(
    @InjectRepository(TicketUser)
    private ticketUserRepository: Repository<TicketUser>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateTicketUserDto): Promise<TicketUser> {
    const cnt = dto.ticketCnt ?? 1;

    return this.dataSource.transaction(async (manager) => {
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
