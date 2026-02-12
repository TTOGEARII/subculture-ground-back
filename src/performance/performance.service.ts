import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from './performance.entity';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
  ) {}

  async findAll(): Promise<Performance[]> {
    try {
      const performances = await this.performanceRepository.find({
        order: { performanceDate: 'ASC', performanceTime: 'ASC' },
      });
      this.logger.log(`공연 목록 조회 성공: ${performances.length}건`);
      return performances;
    } catch (error) {
      this.logger.error('공연 목록 조회 중 오류 발생', error.stack);
      throw error;
    }
  }
}
