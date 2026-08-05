import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WaterFeeStatement } from './water-fee-statement.entity';

/**
 * 명세서의 세대별 입력값 (sb_water_fee_unit) — 검침·가구수·기타·감면.
 * 사용량·수도료·수고비·전기계단·납입액은 저장하지 않고 조회 시 계산한다.
 */
@Entity('sb_water_fee_unit')
@Index('idx_water_fee_unit_stmt_no', ['statementIdx', 'unitNo'], { unique: true })
export class WaterFeeUnit {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Column({ name: 'statement_idx', type: 'bigint', unsigned: true })
  statementIdx: number;

  @ManyToOne(() => WaterFeeStatement, (s) => s.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'statement_idx' })
  statement: WaterFeeStatement;

  @Column({ name: 'unit_no', type: 'varchar', length: 10, comment: '호수 "101"' })
  unitNo: string;

  @Column({ name: 'prev_reading', type: 'int', default: 0, comment: '이전 검침' })
  prevReading: number;

  @Column({ name: 'curr_reading', type: 'int', default: 0, comment: '현재 검침' })
  currReading: number;

  @Column({ name: 'households', type: 'int', default: 1, comment: '가구수' })
  households: number;

  @Column({ name: 'other', type: 'int', default: 0, comment: '기타(원)' })
  other: number;

  @Column({ name: 'discount', type: 'int', default: 0, comment: '감면(원)' })
  discount: number;
}
