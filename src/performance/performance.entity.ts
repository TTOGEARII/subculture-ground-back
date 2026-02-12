import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export type PerformanceStatus = 0 | 1; // 0: 예매마감, 1: 예매중

@Entity('sb_performances')
@Index('idx_sb_performances_date', ['performanceDate'])
@Index('idx_sb_performances_category', ['performanceCategory'])
@Index('idx_sb_performances_status', ['performanceStatus'])
@Index('idx_created_at', ['createdAt'])
export class Performance {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Column({ name: 'sb_performances_name', type: 'varchar', length: 255, comment: '공연명' })
  performanceName: string;

  @Column({ name: 'sb_performances_artist', type: 'varchar', length: 255, comment: '아티스트' })
  performanceArtist: string;

  @Column({ name: 'sb_performances_venue', type: 'varchar', length: 255, comment: '장소' })
  performanceVenue: string;

  @Column({ name: 'sb_performances_date', type: 'date', comment: '공연일' })
  performanceDate: string;

  @Column({ name: 'sb_performances_time', type: 'varchar', length: 10, comment: '공연 시간' })
  performanceTime: string;

  @Column({ name: 'sb_performances_category', type: 'longtext', comment: '카테고리 JSON 배열 (예: ["록","jpop"])' })
  performanceCategory: string;

  @Column({
    name: 'sb_performances_status',
    type: 'tinyint',
    default: 1,
    comment: '0: 예매마감, 1: 예매중',
  })
  performanceStatus: PerformanceStatus;

  @Column({ name: 'sb_performances_price', type: 'int', unsigned: true, default: 0, comment: '가격(원)' })
  performancePrice: number;

  @Column({
    name: 'sb_performances_image',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '공연 이미지 URL',
  })
  performanceImage: string | null;

  @Column({
    name: 'sb_performances_description',
    type: 'text',
    nullable: true,
    comment: '공연 설명',
  })
  performanceDescription: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
