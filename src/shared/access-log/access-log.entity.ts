import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 외부 유저 접속 로그 (sb_access_log)
 * 프론트 비콘이 유입경로(referrer)·landing URL을 보내고, 백엔드가 IP·UA·기기타입을 붙여 저장한다.
 */
@Entity('sb_access_log')
@Index('idx_access_log_created', ['createdAt'])
export class AccessLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Column({
    name: 'ip',
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: '접속 IP (X-Forwarded-For 우선, IPv6 대응 45자)',
  })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true, comment: 'User-Agent' })
  userAgent: string | null;

  @Column({
    name: 'device_type',
    type: 'varchar',
    length: 10,
    comment: 'mobile | tablet | pc',
  })
  deviceType: string;

  @Column({
    name: 'referrer',
    type: 'text',
    nullable: true,
    comment: '유입경로 (document.referrer)',
  })
  referrer: string | null;

  @Column({ name: 'landing_url', type: 'text', nullable: true, comment: '접속 URL' })
  landingUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
  createdAt: Date;
}
