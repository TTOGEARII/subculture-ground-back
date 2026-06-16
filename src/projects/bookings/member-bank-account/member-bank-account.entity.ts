import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity('sb_member_bank_account')
@Index('idx_user_idx', ['userIdx'])
@Index('idx_create_dt', ['createDt'])
export class MemberBankAccount {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  idx: number;

  @Column({ name: 'user_idx', type: 'bigint', default: 0, comment: 'sb_member.idx' })
  userIdx: number;

  @Column({ name: 'bank_name', type: 'varchar', length: 255, nullable: true, comment: '은행이름' })
  bankName: string | null;

  @Column({ name: 'bank_acoount', type: 'int', default: 0, comment: '계좌번호' })
  bankAcoount: number;

  @Column({ name: 'create_dt', type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP', comment: 'create_date' })
  createDt: Date | null;

  @Column({ name: 'update_dt', type: 'datetime', nullable: true, comment: 'update_date' })
  updateDt: Date | null;
}
