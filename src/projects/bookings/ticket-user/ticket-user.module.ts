import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketUser } from './ticket-user.entity';
import { TicketInfo } from '../ticket-info/ticket-info.entity';
import { Performance } from '../performance/performance.entity';
import { KakaoModule } from '../../../shared/kakao/kakao.module';
import { TicketUserService } from './ticket-user.service';
import { TicketUserController } from './ticket-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketUser, TicketInfo, Performance]),
    KakaoModule,
  ],
  controllers: [TicketUserController],
  providers: [TicketUserService],
  exports: [TypeOrmModule, TicketUserService],
})
export class TicketUserModule {}
