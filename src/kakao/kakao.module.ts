import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccount } from '../social-account/social-account.entity';
import { KakaoService } from './kakao.service';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccount])],
  providers: [KakaoService],
  exports: [KakaoService],
})
export class KakaoModule {}
