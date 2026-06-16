import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccount } from '../social-account/social-account.entity';
import { KakaoMessageLog } from './kakao-message-log.entity';
import { KakaoService } from './kakao.service';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccount, KakaoMessageLog])],
  providers: [KakaoService],
  exports: [KakaoService],
})
export class KakaoModule {}
