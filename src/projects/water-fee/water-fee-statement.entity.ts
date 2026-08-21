import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { WaterFeeUnit } from './water-fee-unit.entity';

/**
 * 수도요금 월별 명세서 (sb_water_fee_statement) — 중앙그린빌라.
 * 월별 금액 입력값만 저장하고, 세대별 계산값은 조회 시 계산한다(water-fee.calc).
 */
@Entity('sb_water_fee_statement')
export class WaterFeeStatement {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Index('idx_water_fee_ym', { unique: true })
  @Column({ name: 'year_month', type: 'varchar', length: 7, comment: '정산 년월 "YYYY-MM"' })
  yearMonth: string;

  @Column({ name: 'total_water_fee', type: 'int', default: 0, comment: '총 수도요금(수도국 청구, 원)' })
  totalWaterFee: number;

  @Column({ name: 'common_electricity', type: 'int', default: 0, comment: '공동전기(원)' })
  commonElectricity: number;

  @Column({ name: 'bureau_total_tons', type: 'int', default: 0, comment: '수도국 총사용량(톤)' })
  bureauTotalTons: number;

  @Column({ name: 'stair_cleaning_fee', type: 'int', default: 40000, comment: '계단청소 총액(라인당, 원)' })
  stairCleaningFee: number;

  @Column({ name: 'manager_unit', type: 'varchar', length: 10, default: '401', comment: '반장 호수(수고비 면제 + 관리 권한)' })
  managerUnit: string;

  @Column({ name: 'extra_costs', type: 'simple-json', nullable: true, comment: '추가비용 [{name, amount, excludedUnits?}] (계단청소 외, 제외 세대 뺀 나머지 균등)' })
  extraCosts: { name: string; amount: number; excludedUnits?: string[] }[] | null;

  @OneToMany(() => WaterFeeUnit, (u) => u.statement, { cascade: true })
  units: WaterFeeUnit[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
  updatedAt: Date;
}
