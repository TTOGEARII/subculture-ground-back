import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 이번 달 검침(this_reading) + 입력여부(this_entered) 컬럼.
 * 정산서 N월에 '이번 달(N월) 검침'을 세대가 같은 화면에서 입력 → 다음 달 현재검침이 됨.
 * 멱등: 이미 있으면 건너뛴다. (예약어 없음)
 */
export class AddWaterFeeThisReading1700000015000 implements MigrationInterface {
  private async columnExists(qr: QueryRunner, table: string, column: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    return Number(r[0].c) > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (!(await this.columnExists(qr, 'sb_water_fee_unit', 'this_reading'))) {
      await qr.query(`
        ALTER TABLE sb_water_fee_unit
          ADD COLUMN this_reading INT NOT NULL DEFAULT 0 COMMENT '이번 달 검침(N월)' AFTER reading_entered
      `);
    }
    if (!(await this.columnExists(qr, 'sb_water_fee_unit', 'this_entered'))) {
      await qr.query(`
        ALTER TABLE sb_water_fee_unit
          ADD COLUMN this_entered TINYINT(1) NOT NULL DEFAULT 0 COMMENT '이번 달 검침 입력 여부' AFTER this_reading
      `);
    }
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.columnExists(qr, 'sb_water_fee_unit', 'this_entered')) {
      await qr.query(`ALTER TABLE sb_water_fee_unit DROP COLUMN this_entered`);
    }
    if (await this.columnExists(qr, 'sb_water_fee_unit', 'this_reading')) {
      await qr.query(`ALTER TABLE sb_water_fee_unit DROP COLUMN this_reading`);
    }
  }
}
