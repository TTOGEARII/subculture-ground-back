import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 세대 식별 (sb_water_fee_household) — 호수별 아이디 소프트 잠금.
 * 비밀번호 없음: 처음 입력한 아이디로 등록(claim), 재입장 시 같은 아이디라야 통과.
 * 월(정산표)과 무관한 건물 단위 정보 — 아이디를 잊으면 반장(관리자)이 초기화.
 */
@Entity('sb_water_fee_household')
export class WaterFeeHousehold {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Index('idx_water_fee_household_no', { unique: true })
  @Column({ name: 'unit_no', type: 'varchar', length: 10, comment: '호수' })
  unitNo: string;

  @Column({ name: 'resident_id', type: 'varchar', length: 60, comment: '세대 아이디(이름 등)' })
  residentId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
  updatedAt: Date;
}
