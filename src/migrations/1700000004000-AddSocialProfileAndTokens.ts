import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 소셜 프로필(닉네임 외 프로필 이미지) + 카카오 메시지 발송용 토큰 저장
 * - sb_social_account: profile_image, access_token, refresh_token, token_expires_at
 * - sb_member: sb_profile_image
 */
export class AddSocialProfileAndTokens1700000004000
  implements MigrationInterface
{
  private async columnExists(
    qr: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    return r[0].c > 0;
  }

  private async addIfMissing(
    qr: QueryRunner,
    table: string,
    column: string,
    ddl: string,
  ): Promise<void> {
    if (!(await this.columnExists(qr, table, column))) {
      await qr.query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    }
  }

  public async up(qr: QueryRunner): Promise<void> {
    await this.addIfMissing(
      qr,
      'sb_social_account',
      'profile_image',
      `profile_image VARCHAR(500) NULL COMMENT '소셜 프로필 이미지 URL'`,
    );
    await this.addIfMissing(
      qr,
      'sb_social_account',
      'access_token',
      `access_token TEXT NULL COMMENT '카카오 액세스 토큰'`,
    );
    await this.addIfMissing(
      qr,
      'sb_social_account',
      'refresh_token',
      `refresh_token TEXT NULL COMMENT '카카오 리프레시 토큰'`,
    );
    await this.addIfMissing(
      qr,
      'sb_social_account',
      'token_expires_at',
      `token_expires_at DATETIME NULL COMMENT '액세스 토큰 만료 시각'`,
    );
    await this.addIfMissing(
      qr,
      'sb_member',
      'sb_profile_image',
      `sb_profile_image VARCHAR(500) NULL COMMENT '프로필 이미지 URL (소셜)'`,
    );
  }

  public async down(qr: QueryRunner): Promise<void> {
    for (const col of [
      'profile_image',
      'access_token',
      'refresh_token',
      'token_expires_at',
    ]) {
      if (await this.columnExists(qr, 'sb_social_account', col)) {
        await qr.query(`ALTER TABLE sb_social_account DROP COLUMN ${col}`);
      }
    }
    if (await this.columnExists(qr, 'sb_member', 'sb_profile_image')) {
      await qr.query(`ALTER TABLE sb_member DROP COLUMN sb_profile_image`);
    }
  }
}
