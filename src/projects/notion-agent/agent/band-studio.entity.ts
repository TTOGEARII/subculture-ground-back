import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 합주실 카탈로그 (sb_band_studio) — 우리 DB가 소유하는 합주실 목록.
 *
 * band-room.com 스냅샷으로 시드하지만, 조회 시엔 band-room에 의존하지 않는다.
 * businessId가 있으면 네이버 예약을 직접 조회해 실시간 빈 시간을 얻는다(naver-booking.ts).
 * band-room이 사라져도 이 테이블 + 네이버 직접 조회로 동작한다.
 */
@Entity('sb_band_studio')
export class BandStudio {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  idx: number;

  @Column({
    name: 'external_id',
    type: 'varchar',
    length: 255,
    unique: true,
    comment: '원본(band-room) 스튜디오 식별자 — upsert 기준',
  })
  externalId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Index('idx_band_studio_region')
  @Column({ name: 'region', type: 'varchar', length: 100, default: '' })
  region: string;

  @Column({ name: 'address', type: 'varchar', length: 500, default: '' })
  address: string;

  @Column({ name: 'price_range', type: 'varchar', length: 100, default: '' })
  priceRange: string;

  @Column({ name: 'open_hours', type: 'varchar', length: 100, default: '' })
  openHours: string;

  @Column({ name: 'amenities', type: 'simple-json', nullable: true, comment: '편의시설 배열' })
  amenities: string[] | null;

  @Column({
    name: 'rooms',
    type: 'simple-json',
    nullable: true,
    comment: '룸 요약 [{name, price}] — 오프라인 표시용. 실시간은 네이버에서.',
  })
  rooms: Array<{ name: string; price: string }> | null;

  @Column({ name: 'naver_url', type: 'text', nullable: true })
  naverUrl: string | null;

  @Index('idx_band_studio_business')
  @Column({
    name: 'business_id',
    type: 'varchar',
    length: 32,
    nullable: true,
    comment: '네이버 예약 businessId (있어야 실시간 조회 가능)',
  })
  businessId: string | null;

  @Column({ name: 'biz_item_id', type: 'varchar', length: 32, nullable: true })
  bizItemId: string | null;

  @Column({
    name: 'source',
    type: 'varchar',
    length: 32,
    default: 'band-room-snapshot',
    comment: '데이터 출처',
  })
  source: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
  updatedAt: Date;
}
