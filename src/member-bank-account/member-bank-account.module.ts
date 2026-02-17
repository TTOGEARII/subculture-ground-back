import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberBankAccount } from './member-bank-account.entity';
import { MemberBankAccountService } from './member-bank-account.service';
import { MemberBankAccountController } from './member-bank-account.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MemberBankAccount])],
  controllers: [MemberBankAccountController],
  providers: [MemberBankAccountService],
  exports: [TypeOrmModule, MemberBankAccountService],
})
export class MemberBankAccountModule {}
