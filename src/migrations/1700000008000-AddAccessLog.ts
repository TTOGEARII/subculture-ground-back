import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 외부 유저 접속 로그 테이블 (sb_access_log)
 */
export class AddAccessLog1700000008000 implements MigrationInterface {
  private async tableExists(qr: QueryRunner, table: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table],
    );
    return r[0].c > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_access_log')) return;
    await qr.query(`
      CREATE TABLE sb_access_log (
        idx BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        ip VARCHAR(45) NULL COMMENT '접속 IP (X-Forwarded-For 우선)',
        user_agent TEXT NULL COMMENT 'User-Agent',
        device_type VARCHAR(10) NOT NULL COMMENT 'mobile | tablet | pc',
        referrer TEXT NULL COMMENT '유입경로 (document.referrer)',
        landing_url TEXT NULL COMMENT '접속 URL',
        created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (idx),
        KEY idx_access_log_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_access_log')) {
      await qr.query(`DROP TABLE sb_access_log`);
    }
  }
}
