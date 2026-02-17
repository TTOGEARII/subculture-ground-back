import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  /**
   * 인덱스가 존재하는지 확인하는 헬퍼 함수
   */
  private async indexExists(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = ? 
       AND INDEX_NAME = ?`,
      [tableName, indexName],
    );
    return result[0].count > 0;
  }

  /**
   * 인덱스가 없을 때만 생성하는 헬퍼 함수
   */
  private async createIndexIfNotExists(
    queryRunner: QueryRunner,
    tableName: string,
    index: TableIndex,
  ): Promise<void> {
    const exists = await this.indexExists(queryRunner, tableName, index.name!);
    if (!exists) {
      await queryRunner.createIndex(tableName, index);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // sb_member 테이블 생성 (이미 존재하면 무시)
    await queryRunner.createTable(
      new Table({
        name: 'sb_member',
        columns: [
          {
            name: 'idx',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'sb_email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'sb_password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'sb_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'sb_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'sb_birth_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'sb_status',
            type: 'tinyint',
            default: 1,
            comment: '0:차단, 1:정상',
          },
          {
            name: 'sb_email_verified_at',
            type: 'timestamp',
            isNullable: true,
            comment: '이메일 인증 날짜',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true, // ifNotExists: true
    );

    // sb_member 인덱스 생성 (이미 존재하면 무시)
    await this.createIndexIfNotExists(
      queryRunner,
      'sb_member',
      new TableIndex({
        name: 'idx_sb_email',
        columnNames: ['sb_email'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_member',
      new TableIndex({
        name: 'idx_sb_password',
        columnNames: ['sb_password'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_member',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );

    // sb_performances 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'sb_performances',
        columns: [
          {
            name: 'idx',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'sb_performances_name',
            type: 'varchar',
            length: '255',
            comment: '공연명',
          },
          {
            name: 'sb_performances_artist',
            type: 'varchar',
            length: '255',
            comment: '아티스트',
          },
          {
            name: 'sb_performances_venue',
            type: 'varchar',
            length: '255',
            comment: '장소',
          },
          {
            name: 'sb_performances_date',
            type: 'date',
            comment: '공연일',
          },
          {
            name: 'sb_performances_time',
            type: 'varchar',
            length: '10',
            comment: '공연 시간',
          },
          {
            name: 'sb_performances_category',
            type: 'longtext',
            comment: '카테고리 JSON 배열 (예: ["록","jpop"])',
          },
          {
            name: 'sb_performances_status',
            type: 'tinyint',
            default: 1,
            comment: '0: 예매마감, 1: 예매중',
          },
          {
            name: 'sb_performances_price',
            type: 'int',
            unsigned: true,
            default: 0,
            comment: '가격(원)',
          },
          {
            name: 'sb_performances_image',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '공연 이미지 URL',
          },
          {
            name: 'sb_performances_description',
            type: 'text',
            isNullable: true,
            comment: '공연 설명',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // sb_performances 인덱스 생성 (이미 존재하면 무시)
    await this.createIndexIfNotExists(
      queryRunner,
      'sb_performances',
      new TableIndex({
        name: 'idx_sb_performances_date',
        columnNames: ['sb_performances_date'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_performances',
      new TableIndex({
        name: 'idx_sb_performances_category',
        columnNames: ['sb_performances_category'],
        isFulltext: false,
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_performances',
      new TableIndex({
        name: 'idx_sb_performances_status',
        columnNames: ['sb_performances_status'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_performances',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.dropIndex('sb_performances', 'idx_created_at');
    await queryRunner.dropIndex('sb_performances', 'idx_sb_performances_status');
    await queryRunner.dropIndex('sb_performances', 'idx_sb_performances_category');
    await queryRunner.dropIndex('sb_performances', 'idx_sb_performances_date');

    // 테이블 삭제
    await queryRunner.dropTable('sb_performances');

    await queryRunner.dropIndex('sb_member', 'idx_created_at');
    await queryRunner.dropIndex('sb_member', 'idx_sb_password');
    await queryRunner.dropIndex('sb_member', 'idx_sb_email');

    await queryRunner.dropTable('sb_member');
  }
}
