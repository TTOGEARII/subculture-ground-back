import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('events')
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name);

  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  async getEvents() {
    try {
      return await this.performanceService.findAll();
    } catch (error) {
      this.logger.error('공연 목록 조회 실패', error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '공연 목록을 불러오는데 실패했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
