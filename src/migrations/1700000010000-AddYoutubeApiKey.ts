import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * sb_notion_agent_credential에 youtube_api_key 컬럼 추가 (암호화 저장).
 */
export class AddYoutubeApiKey1700000010000 implements MigrationInterface {
  private async columnExists(qr: QueryRunner, table: string, column: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    return r[0].c > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (await this.columnExists(qr, 'sb_notion_agent_credential', 'youtube_api_key')) return;
    await qr.query(`
      ALTER TABLE sb_notion_agent_credential
      ADD COLUMN youtube_api_key TEXT NULL COMMENT 'YouTube Data API v3 키 (암호화 저장)'
      AFTER gemini_api_key
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.columnExists(qr, 'sb_notion_agent_credential', 'youtube_api_key')) {
      await qr.query(`ALTER TABLE sb_notion_agent_credential DROP COLUMN youtube_api_key`);
    }
  }
}
