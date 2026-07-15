import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './shared/member/member.module';
import { AuthModule } from './shared/auth/auth.module';
import { Member } from './shared/member/member.entity';
import { Performance } from './projects/bookings/performance/performance.entity';
import { TicketInfo } from './projects/bookings/ticket-info/ticket-info.entity';
import { TicketUser } from './projects/bookings/ticket-user/ticket-user.entity';
import { MemberBankAccount } from './projects/bookings/member-bank-account/member-bank-account.entity';
import { SocialAccount } from './shared/social-account/social-account.entity';
import { KakaoMessageLog } from './shared/kakao/kakao-message-log.entity';
import { PerformanceModule } from './projects/bookings/performance/performance.module';
import { TicketInfoModule } from './projects/bookings/ticket-info/ticket-info.module';
import { TicketUserModule } from './projects/bookings/ticket-user/ticket-user.module';
import { MemberBankAccountModule } from './projects/bookings/member-bank-account/member-bank-account.module';
import { NotionCredential } from './projects/notion-agent/notion-credential.entity';
import { BandStudio } from './projects/notion-agent/agent/band-studio.entity';
import { NotionAgentModule } from './projects/notion-agent/notion-agent.module';
import { AccessLog } from './shared/access-log/access-log.entity';
import { AccessLogModule } from './shared/access-log/access-log.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'subculture_ground',
      entities: [Member, Performance, TicketInfo, TicketUser, MemberBankAccount, SocialAccount, KakaoMessageLog, NotionCredential, AccessLog, BandStudio],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    MemberModule,
    AuthModule,
    PerformanceModule,
    TicketInfoModule,
    TicketUserModule,
    MemberBankAccountModule,
    NotionAgentModule,
    AccessLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
