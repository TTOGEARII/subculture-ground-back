import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async findByEmail(email: string): Promise<Member | null> {
    const member = await this.memberRepository.findOne({
      where: { sbEmail: email },
      withDeleted: false, // 삭제된 사용자는 제외
    });
    return member as Member | null;
  }

  async findById(idx: number): Promise<Member | null> {
    const member = await this.memberRepository.findOne({
      where: { idx },
      withDeleted: false,
    });
    return member as Member | null;
  }

  async create(
    email: string,
    password: string,
    name: string,
    phone?: string,
    birthDate?: Date,
  ): Promise<Member> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const member = this.memberRepository.create({
      sbEmail: email,
      sbPassword: hashedPassword,
      sbName: name,
      sbPhone: phone || null,
      sbBirthDate: birthDate || null,
      sbStatus: 1, // 기본값: 정상
      sbEmailVerifiedAt: null,
    });
    const savedMember = await this.memberRepository.save(member);
    return savedMember as Member;
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  }

  async updateStatus(idx: number, status: number): Promise<void> {
    await this.memberRepository.update({ idx }, { sbStatus: status });
  }

  async verifyEmail(idx: number): Promise<void> {
    await this.memberRepository.update(
      { idx },
      { sbEmailVerifiedAt: new Date() },
    );
  }
}
