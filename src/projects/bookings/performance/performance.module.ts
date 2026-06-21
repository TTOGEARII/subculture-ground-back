import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Performance } from './performance.entity';
import { TicketInfo } from '../ticket-info/ticket-info.entity';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';

@Module({
  // 공연 목록/상세에 티켓 최저가(performancePrice)를 붙이기 위해 TicketInfo도 조회한다.
  imports: [TypeOrmModule.forFeature([Performance, TicketInfo])],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [TypeOrmModule, PerformanceService],
})
export class PerformanceModule {}
