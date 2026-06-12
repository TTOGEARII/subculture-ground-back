import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 소셜(카카오) 로그인 지원
 * - sb_social_account 테이블 생성 (회원 ↔ 소셜 제공자 연결)
 * - sb_member.sb_password 를 NULL 허용으로 변경 (소셜 전용 회원은 비밀번호 없음)
 */
export class AddSocialLogin1700000003000 implements MigrationInterface {
  private async tableExists(qr: QueryRunner, table: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table],
    );
    return r[0].c > 0;
  }

  public async up(qr: QueryRunner): Promise<void> {
    if (!(await this.tableExists(qr, 'sb_social_account'))) {
      await qr.query(`
        CREATE TABLE sb_social_account (
          idx BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          user_idx BIGINT UNSIGNED NOT NULL COMMENT 'sb_member.idx',
          provider VARCHAR(20) NOT NULL COMMENT '소셜 제공자 (kakao 등)',
          provider_user_id VARCHAR(255) NOT NULL COMMENT '제공자 측 고유 사용자 ID',
          email VARCHAR(255) NULL COMMENT '소셜 이메일',
          nickname VARCHAR(100) NULL COMMENT '소셜 닉네임',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (idx),
          UNIQUE KEY uq_social_provider_user (provider, provider_user_id),
          KEY idx_social_user_idx (user_idx)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    }

    // 소셜 전용 회원을 위해 비밀번호 NULL 허용
    await qr.query(`ALTER TABLE sb_member MODIFY sb_password VARCHAR(255) NULL`);
  }

  public async down(qr: QueryRunner): Promise<void> {
    if (await this.tableExists(qr, 'sb_social_account')) {
      await qr.query(`DROP TABLE sb_social_account`);
    }
    // 비밀번호 NOT NULL 복원 (NULL 데이터가 있으면 실패할 수 있음)
    await qr.query(
      `ALTER TABLE sb_member MODIFY sb_password VARCHAR(255) NOT NULL`,
    );
  }
}
