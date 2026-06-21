import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Performance } from './performance.entity';
import { TicketInfo } from '../ticket-info/ticket-info.entity';
import { parseJsonArray } from '../../../common/utils/parse.util';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
    @InjectRepository(TicketInfo)
    private ticketInfoRepository: Repository<TicketInfo>,
  ) {}

  /**
   * 공연 응답 가공: performanceCategory를 배열로 변환하고,
   * 티켓 최저가를 performancePrice로 붙인다.
   * 가격은 sb_performances에 없고 sb_ticket_info(미삭제)의 최저가로 계산한다.
   * 티켓을 IN 한 번으로 모아 N+1을 피한다.
   */
  private async withCategoryAndPrice(
    performances: Performance[],
  ): Promise<any[]> {
    const priceMap = await this.minPriceByPerformance(
      performances.map((p) => Number(p.idx)),
    );
    return performances.map((performance) => ({
      ...performance,
      performanceCategory: this.parseCategory(performance),
      performancePrice: priceMap.get(Number(performance.idx)) ?? 0,
    }));
  }

  /** pmIdx별 최저 티켓 가격 맵. 티켓 없는 공연은 맵에 없음(→ 호출부에서 0 처리). */
  private async minPriceByPerformance(
    performanceIdxs: number[],
  ): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (performanceIdxs.length === 0) return map;

    const tickets = await this.ticketInfoRepository.find({
      where: { pmIdx: In(performanceIdxs), delFlag: 0 },
      select: ['pmIdx', 'ticketPrice'],
    });
    for (const t of tickets) {
      const key = Number(t.pmIdx);
      const prev = map.get(key);
      if (prev === undefined || t.ticketPrice < prev) {
        map.set(key, t.ticketPrice);
      }
    }
    return map;
  }

  /** performanceCategory(JSON 문자열)를 배열로 파싱. 파싱 실패 시 경고 로그. */
  private parseCategory(performance: Performance): string[] {
    const categoryArray = parseJsonArray(performance.performanceCategory);
    if (performance.performanceCategory && categoryArray.length === 0) {
      this.logger.warn(`카테고리 JSON 파싱 실패 (idx: ${performance.idx}):`, {
        원본값: performance.performanceCategory,
      });
    }
    return categoryArray;
  }

  async findAll(): Promise<any[]> {
    try {
      const performances = await this.performanceRepository.find({
        order: { performanceDate: 'ASC', performanceTime: 'ASC' },
      });

      const transformedPerformances =
        await this.withCategoryAndPrice(performances);

      this.logger.log(`공연 목록 조회 성공: ${transformedPerformances.length}건`);
      return transformedPerformances;
    } catch (error) {
      this.logger.error('공연 목록 조회 중 오류 발생', error.stack);
      throw error;
    }
  }

  async findOne(idx: number): Promise<any | null> {
    try {
      const performance = await this.performanceRepository.findOne({
        where: { idx },
      });

      if (!performance) {
        return null;
      }

      const [result] = await this.withCategoryAndPrice([performance]);
      return result;
    } catch (error) {
      this.logger.error(`공연 조회 중 오류 발생 (idx: ${idx})`, error.stack);
      throw error;
    }
  }

  async findByUserIdx(userIdx: number): Promise<any[]> {
    try {
      const performances = await this.performanceRepository.find({
        where: { createUserIdx: userIdx },
        order: { createdAt: 'DESC' },
      });

      const transformedPerformances =
        await this.withCategoryAndPrice(performances);

      this.logger.log(`사용자 공연 목록 조회 성공 (userIdx: ${userIdx}): ${transformedPerformances.length}건`);
      return transformedPerformances;
    } catch (error) {
      this.logger.error(`사용자 공연 목록 조회 중 오류 발생 (userIdx: ${userIdx})`, error.stack);
      throw error;
    }
  }

  async create(createDto: any, userIdx: number): Promise<any> {
    try {
      const performance = this.performanceRepository.create({
        performanceName: createDto.performanceName,
        performanceArtist: createDto.performanceArtist,
        performanceVenue: createDto.performanceVenue,
        performanceAddress: createDto.performanceAddress ?? null,
        performanceLat: createDto.performanceLat ?? null,
        performanceLng: createDto.performanceLng ?? null,
        performanceDate: createDto.performanceDate,
        performanceTime: createDto.performanceTime,
        performanceImage: createDto.performanceImage || null,
        performanceDescription: createDto.performanceDescription || null,
        ticketIdx: createDto.ticketIdx || 0,
        createUserIdx: userIdx,
        performanceCategory: createDto.performanceCategory || JSON.stringify([]),
        performanceStatus: 1, // 기본값: 예매중
      });

      const saved = await this.performanceRepository.save(performance);
      this.logger.log(`공연 생성 성공 (idx: ${saved.idx}, userIdx: ${userIdx})`);

      const [result] = await this.withCategoryAndPrice([saved]);
      return result;
    } catch (error) {
      this.logger.error(`공연 생성 중 오류 발생 (userIdx: ${userIdx})`, error.stack);
      throw error;
    }
  }

  async update(idx: number, updateDto: any, userIdx: number): Promise<any> {
    try {
      const performance = await this.performanceRepository.findOne({
        where: { idx, createUserIdx: userIdx },
      });

      if (!performance) {
        return null;
      }

      // 업데이트 가능한 필드만 업데이트
      if (updateDto.performanceName !== undefined) {
        performance.performanceName = updateDto.performanceName;
      }
      if (updateDto.performanceArtist !== undefined) {
        performance.performanceArtist = updateDto.performanceArtist;
      }
      if (updateDto.performanceVenue !== undefined) {
        performance.performanceVenue = updateDto.performanceVenue;
      }
      if (updateDto.performanceAddress !== undefined) {
        performance.performanceAddress = updateDto.performanceAddress;
      }
      if (updateDto.performanceLat !== undefined) {
        performance.performanceLat = updateDto.performanceLat;
      }
      if (updateDto.performanceLng !== undefined) {
        performance.performanceLng = updateDto.performanceLng;
      }
      if (updateDto.performanceDate !== undefined) {
        performance.performanceDate = updateDto.performanceDate;
      }
      if (updateDto.performanceTime !== undefined) {
        performance.performanceTime = updateDto.performanceTime;
      }
      if (updateDto.performanceImage !== undefined) {
        performance.performanceImage = updateDto.performanceImage;
      }
      if (updateDto.performanceDescription !== undefined) {
        performance.performanceDescription = updateDto.performanceDescription;
      }
      if (updateDto.ticketIdx !== undefined) {
        performance.ticketIdx = updateDto.ticketIdx;
      }
      if (updateDto.performanceCategory !== undefined) {
        performance.performanceCategory = updateDto.performanceCategory;
      }

      const saved = await this.performanceRepository.save(performance);
      this.logger.log(`공연 수정 성공 (idx: ${idx}, userIdx: ${userIdx})`);

      const [result] = await this.withCategoryAndPrice([saved]);
      return result;
    } catch (error) {
      this.logger.error(`공연 수정 중 오류 발생 (idx: ${idx}, userIdx: ${userIdx})`, error.stack);
      throw error;
    }
  }

  async remove(idx: number, userIdx: number): Promise<void> {
    try {
      const performance = await this.performanceRepository.findOne({
        where: { idx, createUserIdx: userIdx },
      });

      if (!performance) {
        throw new Error('공연을 찾을 수 없습니다.');
      }

      await this.performanceRepository.softDelete({ idx });
      this.logger.log(`공연 삭제 성공 (idx: ${idx}, userIdx: ${userIdx})`);
    } catch (error) {
      this.logger.error(`공연 삭제 중 오류 발생 (idx: ${idx}, userIdx: ${userIdx})`, error.stack);
      throw error;
    }
  }
}
