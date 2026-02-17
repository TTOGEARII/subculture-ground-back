import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketInfo } from './ticket-info.entity';
import { TicketInfoService } from './ticket-info.service';
import { TicketInfoController } from './ticket-info.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TicketInfo])],
  controllers: [TicketInfoController],
  providers: [TicketInfoService],
  exports: [TypeOrmModule, TicketInfoService],
})
export class TicketInfoModule {}
