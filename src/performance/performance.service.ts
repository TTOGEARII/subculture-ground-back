import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from './performance.entity';
import { parseJsonArray } from '../common/utils/parse.util';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
  ) {}

  async findAll(): Promise<any[]> {
    try {
      const performances = await this.performanceRepository.find({
        order: { performanceDate: 'ASC', performanceTime: 'ASC' },
      });
      
      // performanceCategory를 JSON 문자열에서 배열로 변환하여 응답
      const transformedPerformances = performances.map((performance) => {
        const categoryArray = parseJsonArray(performance.performanceCategory);
        
        // 파싱 실패 시 로그 출력 (빈 배열이 아닌 경우에만)
        if (performance.performanceCategory && categoryArray.length === 0) {
          this.logger.warn(`카테고리 JSON 파싱 실패 (idx: ${performance.idx}):`, {
            원본값: performance.performanceCategory,
          });
        }
        
        // 응답 객체 생성 (performanceCategory를 배열로 변환)
        return {
          ...performance,
          performanceCategory: categoryArray,
        };
      });
      
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

      const categoryArray = parseJsonArray(performance.performanceCategory);

      // 파싱 실패 시 로그 출력 (빈 배열이 아닌 경우에만)
      if (performance.performanceCategory && categoryArray.length === 0) {
        this.logger.warn(`카테고리 JSON 파싱 실패 (idx: ${performance.idx}):`, {
          원본값: performance.performanceCategory,
        });
      }

      // 응답 객체 생성 (performanceCategory를 배열로 변환)
      return {
        ...performance,
        performanceCategory: categoryArray,
      };
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
      
      // performanceCategory를 JSON 문자열에서 배열로 변환하여 응답
      const transformedPerformances = performances.map((performance) => {
        const categoryArray = parseJsonArray(performance.performanceCategory);
        
        // 파싱 실패 시 로그 출력 (빈 배열이 아닌 경우에만)
        if (performance.performanceCategory && categoryArray.length === 0) {
          this.logger.warn(`카테고리 JSON 파싱 실패 (idx: ${performance.idx}):`, {
            원본값: performance.performanceCategory,
          });
        }
        
        // 응답 객체 생성 (performanceCategory를 배열로 변환)
        return {
          ...performance,
          performanceCategory: categoryArray,
        };
      });
      
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

      const categoryArray = parseJsonArray(saved.performanceCategory);
      return {
        ...saved,
        performanceCategory: categoryArray,
      };
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

      const categoryArray = parseJsonArray(saved.performanceCategory);
      return {
        ...saved,
        performanceCategory: categoryArray,
      };
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
