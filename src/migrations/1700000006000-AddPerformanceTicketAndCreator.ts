import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * sb_performances 엔티티에는 있으나 기존 마이그레이션에 누락됐던 컬럼 보강.
 * (dev는 synchronize:true로 가려져 있었음 — prod 마이그레이션 정합성 맞춤)
 */
export class AddPerformanceTicketAndCreator1700000006000
  implements MigrationInterface
{
  name = 'AddPerformanceTicketAndCreator1700000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sb_performances\` ADD \`ticket_idx\` bigint NOT NULL COMMENT 'sb_ticket_info.idx' DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sb_performances\` ADD \`create_user_idx\` bigint NOT NULL COMMENT 'sb_member.idx'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sb_performances\` DROP COLUMN \`create_user_idx\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sb_performances\` DROP COLUMN \`ticket_idx\``,
    );
  }
}
