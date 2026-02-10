import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('sb_member')
@Index('idx_sb_email', ['sbEmail'])
@Index('idx_sb_password', ['sbPassword'])
@Index('idx_created_at', ['createdAt'])
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Column({ name: 'sb_email', type: 'varchar', length: 255, unique: true })
  sbEmail: string;

  @Column({ name: 'sb_password', type: 'varchar', length: 255 })
  sbPassword: string;

  @Column({ name: 'sb_name', type: 'varchar', length: 100 })
  sbName: string;

  @Column({ name: 'sb_phone', type: 'varchar', length: 20, nullable: true })
  sbPhone: string | null;

  @Column({ name: 'sb_birth_date', type: 'date', nullable: true })
  sbBirthDate: Date | null;

  @Column({
    name: 'sb_status',
    type: 'tinyint',
    default: 1,
    comment: '0:차단, 1:정상',
  })
  sbStatus: number;

  @Column({
    name: 'sb_email_verified_at',
    type: 'timestamp',
    nullable: true,
    comment: '이메일 인증 날짜',
  })
  sbEmailVerifiedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
