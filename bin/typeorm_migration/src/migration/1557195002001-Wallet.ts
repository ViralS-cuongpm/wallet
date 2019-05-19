import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Wallet1557195002001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'wallet';
    await queryRunner.createTable(
      new Table({
        name: tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'label',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'secret',
            type: 'text',
          },
          {
            name: 'is_hd',
            type: 'tinyint',
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
    await queryRunner.createIndex(
      tableName,
      new TableIndex({
        name: 'wallet_wallet_user_id',
        columnNames: ['user_id'],
      })
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`id`, `user_id`, `label`, `currency`, `secret`, `is_hd`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('1001', '1', 'Dummy BTC Wallet', 'btc', 'dummy', 1, 1557636432024, 1557636432024)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'wallet');
  }
}
