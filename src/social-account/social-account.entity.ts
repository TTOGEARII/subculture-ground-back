import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 소셜(OAuth) 로그인 계정 연결 테이블.
 * 한 회원(sb_member)이 여러 소셜 제공자(provider)와 연결될 수 있다.
 */
@Entity('sb_social_account')
@Index('uq_social_provider_user', ['provider', 'providerUserId'], { unique: true })
@Index('idx_social_user_idx', ['userIdx'])
export class SocialAccount {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Column({ name: 'user_idx', type: 'bigint', unsigned: true, comment: 'sb_member.idx' })
  userIdx: number;

  @Column({ name: 'provider', type: 'varchar', length: 20, comment: '소셜 제공자 (kakao 등)' })
  provider: string;

  @Column({
    name: 'provider_user_id',
    type: 'varchar',
    length: 255,
    comment: '제공자 측 고유 사용자 ID',
  })
  providerUserId: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true, comment: '소셜 이메일' })
  email: string | null;

  @Column({ name: 'nickname', type: 'varchar', length: 100, nullable: true, comment: '소셜 닉네임' })
  nickname: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
