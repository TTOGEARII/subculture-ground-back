import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 회원별 노션 에이전트 자격증명.
 * notion_token / anthropic_api_key 는 저장 전 crypto.util 로 암호화된다.
 */
@Entity('sb_notion_agent_credential')
@Index('idx_notion_credential_user', ['userIdx'], { unique: true })
export class NotionCredential {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Column({ name: 'user_idx', type: 'bigint', comment: 'sb_member.idx' })
  userIdx: number;

  @Column({
    name: 'notion_token',
    type: 'text',
    nullable: true,
    comment: '노션 Integration 토큰 (암호화 저장)',
  })
  notionToken: string | null;

  @Column({
    name: 'anthropic_api_key',
    type: 'text',
    nullable: true,
    comment: 'Anthropic API 키 (암호화 저장)',
  })
  anthropicApiKey: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
  updatedAt: Date;
}
