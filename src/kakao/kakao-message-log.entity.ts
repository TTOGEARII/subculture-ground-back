import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 카카오톡 알림 발송 로그.
 * 발송 시도마다 1행 — 성공/실패/스킵 결과와 본문, 연관 엔티티를 기록한다.
 */
@Entity('sb_kakao_message_log')
@Index('idx_kml_user', ['userIdx'])
@Index('idx_kml_created', ['createdAt'])
export class KakaoMessageLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Column({ name: 'user_idx', type: 'bigint', unsigned: true, comment: '수신 회원 sb_member.idx' })
  userIdx: number;

  @Column({ name: 'message_type', type: 'varchar', length: 40, comment: '메시지 종류 (booking_confirm 등)' })
  messageType: string;

  @Column({ name: 'content', type: 'text', nullable: true, comment: '발송 메시지 본문' })
  content: string | null;

  @Column({ name: 'status', type: 'varchar', length: 10, comment: 'success | fail | skipped' })
  status: string;

  @Column({ name: 'error', type: 'text', nullable: true, comment: '실패 사유 (카카오 응답 등)' })
  error: string | null;

  @Column({ name: 'ref_type', type: 'varchar', length: 40, nullable: true, comment: '연관 엔티티 종류 (ticket_user 등)' })
  refType: string | null;

  @Column({ name: 'ref_idx', type: 'bigint', nullable: true, comment: '연관 엔티티 idx' })
  refIdx: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
