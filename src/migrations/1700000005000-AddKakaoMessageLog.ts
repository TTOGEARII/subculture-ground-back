import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 카카오톡 알림 발송 로그 테이블 (sb_kakao_message_log)
 */
export class AddKakaoMessageLog1700000005000 implements MigrationInterface {
  private async tableExists(qr: QueryRunner, table: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table],
    );
    return r[0].c > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_kakao_message_log')) return;
    await qr.query(`
      CREATE TABLE sb_kakao_message_log (
        idx BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_idx BIGINT UNSIGNED NOT NULL COMMENT '수신 회원 sb_member.idx',
        message_type VARCHAR(40) NOT NULL COMMENT '메시지 종류 (booking_confirm 등)',
        content TEXT NULL COMMENT '발송 메시지 본문',
        status VARCHAR(10) NOT NULL COMMENT 'success | fail | skipped',
        error TEXT NULL COMMENT '실패 사유',
        ref_type VARCHAR(40) NULL COMMENT '연관 엔티티 종류 (ticket_user 등)',
        ref_idx BIGINT NULL COMMENT '연관 엔티티 idx',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (idx),
        KEY idx_kml_user (user_idx),
        KEY idx_kml_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_kakao_message_log')) {
      await qr.query(`DROP TABLE sb_kakao_message_log`);
    }
  }
}
