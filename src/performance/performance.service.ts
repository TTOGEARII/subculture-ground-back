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
}
