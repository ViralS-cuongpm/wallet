import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Webhook1557195005001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: process.env.TYPEORM_PREFIX + 'webhook',
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
            width: 20,
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: false,
            width: 255,
          },
          {
            name: 'created_at',
            type: 'bigint',
          },
          {
            name: 'updated_at',
            type: 'bigint',
          },
        ],
      }),
      true
    );
    const table_name = process.env.TYPEORM_PREFIX + 'webhook';
    await queryRunner.query(`ALTER TABLE ` + table_name + ` ALTER type SET DEFAULT "common"`);
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'webhook',
      new TableIndex({
        name: 'webhook_user_id',
        columnNames: ['user_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'webhook', 'webhook_user_id');
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'webhook');
  }
}
