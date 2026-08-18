import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 세대별 '검침 입력 여부'(reading_entered) 컬럼 — 미입력 세대는 지난달 사용량으로 추정.
 * 멱등: 이미 있으면 건너뛴다. (예약어 없음)
 * 기존 행 백필: 실제 검침이 있는 세대(현재≠이전, 즉 사용량>0)만 '입력됨'으로 표시.
 * → 완결된 과거 달은 그대로 유지, 진행 중인 이번 달의 미입력분은 추정 대상으로 남는다.
 */
export class AddWaterFeeReadingEntered1700000014000 implements MigrationInterface {
  private async columnExists(qr: QueryRunner, table: string, column: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    return Number(r[0].c) > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (!(await this.columnExists(qr, 'sb_water_fee_unit', 'reading_entered'))) {
      await qr.query(`
        ALTER TABLE sb_water_fee_unit
          ADD COLUMN reading_entered TINYINT(1) NOT NULL DEFAULT 0
          COMMENT '이번 달 검침 입력 여부(미입력이면 지난달로 추정)' AFTER discount
      `);
      // 실제 검침이 있는 세대만 입력됨으로(현재≠이전). 미입력분은 0(추정 대상).
      await qr.query(`UPDATE sb_water_fee_unit SET reading_entered = (curr_reading <> prev_reading)`);
    }
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.columnExists(qr, 'sb_water_fee_unit', 'reading_entered')) {
      await qr.query(`ALTER TABLE sb_water_fee_unit DROP COLUMN reading_entered`);
    }
  }
}
