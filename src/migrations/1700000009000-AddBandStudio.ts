import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 합주실 카탈로그 테이블 (sb_band_studio).
 * 데이터 시드는 BandStudioService.onModuleInit이 부팅 시 처리한다(테이블이 비어 있을 때만).
 */
export class AddBandStudio1700000009000 implements MigrationInterface {
  private async tableExists(qr: QueryRunner, table: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table],
    );
    return r[0].c > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_band_studio')) return;
    await qr.query(`
      CREATE TABLE sb_band_studio (
        idx BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        external_id VARCHAR(255) NOT NULL COMMENT '원본(band-room) 스튜디오 식별자 — upsert 기준',
        name VARCHAR(255) NOT NULL,
        region VARCHAR(100) NOT NULL DEFAULT '',
        address VARCHAR(500) NOT NULL DEFAULT '',
        price_range VARCHAR(100) NOT NULL DEFAULT '',
        open_hours VARCHAR(100) NOT NULL DEFAULT '',
        amenities TEXT NULL COMMENT '편의시설 배열(JSON)',
        rooms TEXT NULL COMMENT '룸 요약 [{name, price}] — 오프라인 표시용',
        naver_url TEXT NULL,
        business_id VARCHAR(32) NULL COMMENT '네이버 예약 businessId (있어야 실시간 조회 가능)',
        biz_item_id VARCHAR(32) NULL,
        source VARCHAR(32) NOT NULL DEFAULT 'band-room-snapshot' COMMENT '데이터 출처',
        updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (idx),
        UNIQUE KEY uq_band_studio_external (external_id),
        KEY idx_band_studio_region (region),
        KEY idx_band_studio_business (business_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_band_studio')) {
      await qr.query(`DROP TABLE sb_band_studio`);
    }
  }
}
