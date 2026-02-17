import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddTicketTables1700000001000 implements MigrationInterface {
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
    // sb_ticket_info 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'sb_ticket_info',
        columns: [
          {
            name: 'idx',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'pm_idx',
            type: 'bigint',
            default: 0,
            comment: 'sb_performances.idx',
          },
          {
            name: 'ticket_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '티켓이름',
          },
          {
            name: 'ticket_count',
            type: 'int',
            default: 0,
            comment: '티켓 구매 카운트',
          },
          {
            name: 'ticket_max',
            type: 'int',
            default: 0,
            comment: '티켓구매 최대수량',
          },
          {
            name: 'ticket_min',
            type: 'int',
            default: 0,
            comment: '티켓구매 최소수량',
          },
          {
            name: 'ticket_price',
            type: 'int',
            default: 0,
            comment: '티켓 가격',
          },
          {
            name: 'ticket_type',
            type: 'int',
            default: 0,
            comment: '티켓 타입',
          },
          {
            name: 'del_flag',
            type: 'tinyint',
            default: 0,
            comment: '0:정상, 1:삭제',
          },
          {
            name: 'create_dt',
            type: 'datetime',
            isNullable: true,
            default: 'CURRENT_TIMESTAMP',
            comment: 'create date',
          },
          {
            name: 'update_dt',
            type: 'datetime',
            isNullable: true,
            comment: 'update date',
          },
          {
            name: 'delete_dt',
            type: 'datetime',
            isNullable: true,
            comment: 'delete date',
          },
        ],
      }),
      true, // ifNotExists: true
    );

    // sb_ticket_info 인덱스 생성
    await this.createIndexIfNotExists(
      queryRunner,
      'sb_ticket_info',
      new TableIndex({
        name: 'idx_pm_idx',
        columnNames: ['pm_idx'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_ticket_info',
      new TableIndex({
        name: 'idx_ticket_name',
        columnNames: ['ticket_name'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_ticket_info',
      new TableIndex({
        name: 'idx_del_flag',
        columnNames: ['del_flag'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_ticket_info',
      new TableIndex({
        name: 'idx_create_dt',
        columnNames: ['create_dt'],
      }),
    );

    // sb_ticket_user 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'sb_ticket_user',
        columns: [
          {
            name: 'idx',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'ticket_idx',
            type: 'bigint',
            default: 0,
            comment: 'sb_ticket_info.idx',
          },
          {
            name: 'user_idx',
            type: 'bigint',
            default: 0,
            comment: 'sb_member.idx',
          },
          {
            name: 'ticket_cnt',
            type: 'int',
            default: 0,
            comment: '티켓수량',
          },
          {
            name: 'ticket_total_price',
            type: 'int',
            default: 0,
            comment: '티켓 총 구매 금액',
          },
          {
            name: 'ticket_status',
            type: 'tinyint',
            default: 0,
            comment: '0:대기 / 1:결제완료 / 2:체크완료 / 3:취소',
          },
          {
            name: 'ticket_chk_dt',
            type: 'datetime',
            isNullable: true,
            comment: '티켓 체크인 시간',
          },
          {
            name: 'ticket_pay_complete_dt',
            type: 'datetime',
            isNullable: true,
            comment: '티켓 결제완료 시간',
          },
          {
            name: 'create_dt',
            type: 'datetime',
            isNullable: true,
            default: 'CURRENT_TIMESTAMP',
            comment: 'create date',
          },
          {
            name: 'update_dt',
            type: 'datetime',
            isNullable: true,
            comment: 'update date',
          },
          {
            name: 'delete_dt',
            type: 'datetime',
            isNullable: true,
            comment: 'delete date',
          },
        ],
      }),
      true, // ifNotExists: true
    );

    // sb_ticket_user 인덱스 생성
    await this.createIndexIfNotExists(
      queryRunner,
      'sb_ticket_user',
      new TableIndex({
        name: 'idx_ticket_idx',
        columnNames: ['ticket_idx'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_ticket_user',
      new TableIndex({
        name: 'idx_user_idx',
        columnNames: ['user_idx'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_ticket_user',
      new TableIndex({
        name: 'idx_create_dt',
        columnNames: ['create_dt'],
      }),
    );

    // sb_member_bank_account 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'sb_member_bank_account',
        columns: [
          {
            name: 'idx',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_idx',
            type: 'bigint',
            default: 0,
            comment: 'sb_member.idx',
          },
          {
            name: 'bank_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '은행이름',
          },
          {
            name: 'bank_acoount',
            type: 'int',
            default: 0,
            comment: '계좌번호',
          },
          {
            name: 'create_dt',
            type: 'datetime',
            isNullable: true,
            default: 'CURRENT_TIMESTAMP',
            comment: 'create_date',
          },
          {
            name: 'update_dt',
            type: 'datetime',
            isNullable: true,
            comment: 'update_date',
          },
        ],
      }),
      true, // ifNotExists: true
    );

    // sb_member_bank_account 인덱스 생성
    await this.createIndexIfNotExists(
      queryRunner,
      'sb_member_bank_account',
      new TableIndex({
        name: 'idx_user_idx',
        columnNames: ['user_idx'],
      }),
    );

    await this.createIndexIfNotExists(
      queryRunner,
      'sb_member_bank_account',
      new TableIndex({
        name: 'idx_create_dt',
        columnNames: ['create_dt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.dropIndex('sb_member_bank_account', 'idx_create_dt');
    await queryRunner.dropIndex('sb_member_bank_account', 'idx_user_idx');

    // 테이블 삭제
    await queryRunner.dropTable('sb_member_bank_account');

    await queryRunner.dropIndex('sb_ticket_user', 'idx_create_dt');
    await queryRunner.dropIndex('sb_ticket_user', 'idx_user_idx');
    await queryRunner.dropIndex('sb_ticket_user', 'idx_ticket_idx');

    await queryRunner.dropTable('sb_ticket_user');

    await queryRunner.dropIndex('sb_ticket_info', 'idx_create_dt');
    await queryRunner.dropIndex('sb_ticket_info', 'idx_del_flag');
    await queryRunner.dropIndex('sb_ticket_info', 'idx_ticket_name');
    await queryRunner.dropIndex('sb_ticket_info', 'idx_pm_idx');

    await queryRunner.dropTable('sb_ticket_info');
  }
}
