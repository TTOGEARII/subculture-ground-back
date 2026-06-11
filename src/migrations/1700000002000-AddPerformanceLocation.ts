import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * sb_performances 에 공연장 상세주소/좌표(위도·경도) 컬럼 추가
 * - sb_performances_address : 도로명/지번 상세주소
 * - sb_performances_lat     : 위도
 * - sb_performances_lng     : 경도
 */
export class AddPerformanceLocation1700000002000 implements MigrationInterface {
  private async columnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
      [tableName, columnName],
    );
    return result[0].count > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = 'sb_performances';

    if (!(await this.columnExists(queryRunner, table, 'sb_performances_address'))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: 'sb_performances_address',
          type: 'varchar',
          length: '500',
          isNullable: true,
          comment: '상세주소(도로명/지번)',
        }),
      );
    }

    if (!(await this.columnExists(queryRunner, table, 'sb_performances_lat'))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: 'sb_performances_lat',
          type: 'decimal',
          precision: 10,
          scale: 7,
          isNullable: true,
          comment: '위도',
        }),
      );
    }

    if (!(await this.columnExists(queryRunner, table, 'sb_performances_lng'))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: 'sb_performances_lng',
          type: 'decimal',
          precision: 10,
          scale: 7,
          isNullable: true,
          comment: '경도',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = 'sb_performances';

    if (await this.columnExists(queryRunner, table, 'sb_performances_lng')) {
      await queryRunner.dropColumn(table, 'sb_performances_lng');
    }
    if (await this.columnExists(queryRunner, table, 'sb_performances_lat')) {
      await queryRunner.dropColumn(table, 'sb_performances_lat');
    }
    if (await this.columnExists(queryRunner, table, 'sb_performances_address')) {
      await queryRunner.dropColumn(table, 'sb_performances_address');
    }
  }
}
