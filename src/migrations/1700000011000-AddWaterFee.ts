import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 수도요금 정산 테이블 (sb_water_fee_statement, sb_water_fee_unit).
 */
export class AddWaterFee1700000011000 implements MigrationInterface {
  private async tableExists(qr: QueryRunner, table: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table],
    );
    return r[0].c > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (!(await this.tableExists(qr, 'sb_water_fee_statement'))) {
      await qr.query(`
        CREATE TABLE sb_water_fee_statement (
          idx BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          year_month VARCHAR(7) NOT NULL COMMENT '정산 년월 YYYY-MM',
          total_water_fee INT NOT NULL DEFAULT 0 COMMENT '총 수도요금(원)',
          common_electricity INT NOT NULL DEFAULT 0 COMMENT '공동전기(원)',
          bureau_total_tons INT NOT NULL DEFAULT 0 COMMENT '수도국 총사용량(톤)',
          stair_cleaning_fee INT NOT NULL DEFAULT 40000 COMMENT '계단청소 총액(라인당, 원)',
          created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (idx),
          UNIQUE KEY idx_water_fee_ym (year_month)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    }
    if (!(await this.tableExists(qr, 'sb_water_fee_unit'))) {
      await qr.query(`
        CREATE TABLE sb_water_fee_unit (
          idx BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          statement_idx BIGINT UNSIGNED NOT NULL,
          unit_no VARCHAR(10) NOT NULL COMMENT '호수',
          prev_reading INT NOT NULL DEFAULT 0 COMMENT '이전 검침',
          curr_reading INT NOT NULL DEFAULT 0 COMMENT '현재 검침',
          households INT NOT NULL DEFAULT 1 COMMENT '가구수',
          other INT NOT NULL DEFAULT 0 COMMENT '기타(원)',
          discount INT NOT NULL DEFAULT 0 COMMENT '감면(원)',
          PRIMARY KEY (idx),
          UNIQUE KEY idx_water_fee_unit_stmt_no (statement_idx, unit_no),
          CONSTRAINT fk_water_fee_unit_stmt FOREIGN KEY (statement_idx)
            REFERENCES sb_water_fee_statement (idx) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    }
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_water_fee_unit')) await qr.query(`DROP TABLE sb_water_fee_unit`);
    if (await this.tableExists(qr, 'sb_water_fee_statement')) await qr.query(`DROP TABLE sb_water_fee_statement`);
  }
}
