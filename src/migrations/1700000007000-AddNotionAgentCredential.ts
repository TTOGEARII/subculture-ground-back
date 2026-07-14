import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 노션 AI 에이전트 자격증명 테이블 (sb_notion_agent_credential)
 * 회원별 노션 토큰 / Gemini API 키를 암호화해 저장한다.
 */
export class AddNotionAgentCredential1700000007000 implements MigrationInterface {
  private async tableExists(qr: QueryRunner, table: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table],
    );
    return r[0].c > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_notion_agent_credential')) return;
    await qr.query(`
      CREATE TABLE sb_notion_agent_credential (
        idx BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_idx BIGINT NOT NULL COMMENT 'sb_member.idx',
        notion_token TEXT NULL COMMENT '노션 Integration 토큰 (암호화 저장)',
        gemini_api_key TEXT NULL COMMENT 'Gemini API 키 (암호화 저장)',
        created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (idx),
        UNIQUE KEY idx_notion_credential_user (user_idx)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_notion_agent_credential')) {
      await qr.query(`DROP TABLE sb_notion_agent_credential`);
    }
  }
}
