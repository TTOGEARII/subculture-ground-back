import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { Member } from './member/member.entity';
import { Performance } from './performance/performance.entity';
import { TicketInfo } from './ticket-info/ticket-info.entity';
import { TicketUser } from './ticket-user/ticket-user.entity';
import { MemberBankAccount } from './member-bank-account/member-bank-account.entity';
import { PerformanceModule } from './performance/performance.module';
import { TicketInfoModule } from './ticket-info/ticket-info.module';
import { TicketUserModule } from './ticket-user/ticket-user.module';
import { MemberBankAccountModule } from './member-bank-account/member-bank-account.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'subculture_ground',
      entities: [Member, Performance, TicketInfo, TicketUser, MemberBankAccount],
      synchronize: true, // 프로덕션에서는 false로 설정하고 마이그레이션 사용
    }),
    MemberModule,
    AuthModule,
    PerformanceModule,
    TicketInfoModule,
    TicketUserModule,
    MemberBankAccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
