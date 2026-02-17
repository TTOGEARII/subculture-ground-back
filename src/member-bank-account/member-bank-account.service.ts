import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberBankAccount } from './member-bank-account.entity';
import { CreateMemberBankAccountDto } from './dto/create-member-bank-account.dto';
import { UpdateMemberBankAccountDto } from './dto/update-member-bank-account.dto';

@Injectable()
export class MemberBankAccountService {
  private readonly logger = new Logger(MemberBankAccountService.name);

  constructor(
    @InjectRepository(MemberBankAccount)
    private memberBankAccountRepository: Repository<MemberBankAccount>,
  ) {}

  async create(dto: CreateMemberBankAccountDto): Promise<MemberBankAccount> {
    const entity = this.memberBankAccountRepository.create({
      userIdx: dto.userIdx,
      bankName: dto.bankName ?? null,
      bankAcoount: dto.bankAcoount ?? 0,
    });
    const saved = await this.memberBankAccountRepository.save(entity);
    this.logger.log(`회원 계좌 생성: idx=${saved.idx}`);
    return saved;
  }

  async findAll(): Promise<MemberBankAccount[]> {
    return this.memberBankAccountRepository.find({
      order: { idx: 'ASC' },
    });
  }

  async findByUserIdx(userIdx: number): Promise<MemberBankAccount[]> {
    return this.memberBankAccountRepository.find({
      where: { userIdx },
      order: { idx: 'ASC' },
    });
  }

  async findOne(idx: number): Promise<MemberBankAccount> {
    const row = await this.memberBankAccountRepository.findOne({ where: { idx } });
    if (!row) {
      throw new NotFoundException(`회원 계좌 정보를 찾을 수 없습니다. (idx: ${idx})`);
    }
    return row;
  }

  async update(idx: number, dto: UpdateMemberBankAccountDto): Promise<MemberBankAccount> {
    const row = await this.findOne(idx);
    if (dto.userIdx !== undefined) row.userIdx = dto.userIdx;
    if (dto.bankName !== undefined) row.bankName = dto.bankName;
    if (dto.bankAcoount !== undefined) row.bankAcoount = dto.bankAcoount;

    row.updateDt = new Date();
    await this.memberBankAccountRepository.save(row);
    this.logger.log(`회원 계좌 수정: idx=${idx}`);
    return row;
  }

  async remove(idx: number): Promise<void> {
    const row = await this.findOne(idx);
    await this.memberBankAccountRepository.remove(row);
    this.logger.log(`회원 계좌 삭제: idx=${idx}`);
  }
}
