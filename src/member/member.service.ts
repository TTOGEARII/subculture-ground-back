import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { SocialAccount } from '../social-account/social-account.entity';
import * as bcrypt from 'bcrypt';

export interface SocialProfile {
  provider: string; // 'kakao'
  providerUserId: string;
  email: string | null;
  nickname: string | null;
  profileImage?: string | null;
  // 메시지 발송용 토큰 (선택)
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
}

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(SocialAccount)
    private socialRepository: Repository<SocialAccount>,
  ) {}

  /**
   * 소셜 프로필로 회원을 찾거나(없으면) 생성하고, 소셜 계정을 연결한다.
   * 1) 소셜 계정 연결이 있으면 그 회원 반환
   * 2) 같은 이메일의 기존 회원이 있으면 연결
   * 3) 없으면 비밀번호 없는 신규 회원 생성 후 연결
   */
  async findOrCreateBySocial(profile: SocialProfile): Promise<Member> {
    const linked = await this.socialRepository.findOne({
      where: { provider: profile.provider, providerUserId: profile.providerUserId },
    });

    let member: Member | null = null;
    if (linked) {
      member = await this.findById(linked.userIdx);
    }

    // 연결이 없으면: 이메일로 기존 회원 매칭, 없으면 신규 생성
    if (!member) {
      if (profile.email) {
        member = await this.findByEmail(profile.email);
      }
      if (!member) {
        const email = profile.email ?? `${profile.provider}_${profile.providerUserId}@social.local`;
        member = this.memberRepository.create({
          sbEmail: email,
          sbPassword: null,
          sbName: profile.nickname ?? '소셜 사용자',
          sbProfileImage: profile.profileImage ?? null,
          sbPhone: null,
          sbBirthDate: null,
          sbStatus: 1,
          sbEmailVerifiedAt: profile.email ? new Date() : null,
        });
        member = await this.memberRepository.save(member);
      }
    }

    // 프로필 이미지/이름 최신화 (소셜 회원이 직접 바꾸지 않은 경우)
    let memberChanged = false;
    if (profile.profileImage && member.sbProfileImage !== profile.profileImage) {
      member.sbProfileImage = profile.profileImage;
      memberChanged = true;
    }
    // 이름이 기본 플레이스홀더일 때만 닉네임으로 갱신 (사용자가 바꾼 이름은 보존)
    if (profile.nickname && (!member.sbName || member.sbName === '소셜 사용자')) {
      member.sbName = profile.nickname;
      memberChanged = true;
    }
    if (memberChanged) await this.memberRepository.save(member);

    // 소셜 계정 upsert — 닉네임/이미지/토큰을 매 로그인마다 갱신 (메시지 발송용 토큰 유지)
    const social = linked ?? this.socialRepository.create({
      userIdx: member.idx,
      provider: profile.provider,
      providerUserId: profile.providerUserId,
    });
    social.userIdx = member.idx;
    social.email = profile.email;
    social.nickname = profile.nickname;
    social.profileImage = profile.profileImage ?? null;
    if (profile.accessToken !== undefined) social.accessToken = profile.accessToken;
    if (profile.refreshToken !== undefined) social.refreshToken = profile.refreshToken;
    if (profile.tokenExpiresAt !== undefined) social.tokenExpiresAt = profile.tokenExpiresAt;
    await this.socialRepository.save(social);

    return member;
  }

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
