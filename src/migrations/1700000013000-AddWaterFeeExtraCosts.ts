import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 정산표 추가비용(extra_costs) 컬럼 — 계단청소 외 임의 공동비용 [{name, amount}].
 * 멱등: 이미 있으면 건너뛴다. (예약어 없음)
 */
export class AddWaterFeeExtraCosts1700000013000 implements MigrationInterface {
  private async columnExists(qr: QueryRunner, table: string, column: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    return Number(r[0].c) > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (!(await this.columnExists(qr, 'sb_water_fee_statement', 'extra_costs'))) {
      await qr.query(`
        ALTER TABLE sb_water_fee_statement
          ADD COLUMN extra_costs LONGTEXT NULL
          COMMENT '추가비용 [{name, amount}] (계단청소 외, 전체 균등)' AFTER manager_unit
      `);
    }
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.columnExists(qr, 'sb_water_fee_statement', 'extra_costs')) {
      await qr.query(`ALTER TABLE sb_water_fee_statement DROP COLUMN extra_costs`);
    }
  }
}
