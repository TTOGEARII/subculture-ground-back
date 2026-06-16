import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { SocialAccount } from '../social-account/social-account.entity';
import { MemberService } from './member.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member, SocialAccount])],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
