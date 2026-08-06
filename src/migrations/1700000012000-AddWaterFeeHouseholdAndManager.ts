import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 세대 식별(sb_water_fee_household) + 정산표 반장 호수(manager_unit).
 * 멱등: 이미 있으면 건너뛴다. (예약어 없음 — unit_no/resident_id/manager_unit)
 */
export class AddWaterFeeHouseholdAndManager1700000012000 implements MigrationInterface {
  private async tableExists(qr: QueryRunner, table: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table],
    );
    return Number(r[0].c) > 0;
  }

  private async columnExists(qr: QueryRunner, table: string, column: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    return Number(r[0].c) > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (!(await this.tableExists(qr, 'sb_water_fee_household'))) {
      await qr.query(`
        CREATE TABLE sb_water_fee_household (
          idx BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          unit_no VARCHAR(10) NOT NULL COMMENT '호수',
          resident_id VARCHAR(60) NOT NULL COMMENT '세대 아이디(이름 등)',
          created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (idx),
          UNIQUE KEY idx_water_fee_household_no (unit_no)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    }
    if (!(await this.columnExists(qr, 'sb_water_fee_statement', 'manager_unit'))) {
      await qr.query(`
        ALTER TABLE sb_water_fee_statement
          ADD COLUMN manager_unit VARCHAR(10) NOT NULL DEFAULT '401'
          COMMENT '반장 호수(수고비 면제 + 관리 권한)' AFTER stair_cleaning_fee
      `);
    }
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.columnExists(qr, 'sb_water_fee_statement', 'manager_unit')) {
      await qr.query(`ALTER TABLE sb_water_fee_statement DROP COLUMN manager_unit`);
    }
    if (await this.tableExists(qr, 'sb_water_fee_household')) {
      await qr.query(`DROP TABLE sb_water_fee_household`);
    }
  }
}
