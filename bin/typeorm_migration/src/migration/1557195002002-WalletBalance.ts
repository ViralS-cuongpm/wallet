import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class WalletBalance1557195002002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'wallet_balance';
    await queryRunner.createTable(
      new Table({
        name: process.env.TYPEORM_PREFIX + 'wallet_balance',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isPrimary: true,
          },
          {
            name: 'wallet_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            width: 200,
            isNullable: false,
          },
          {
            name: 'balance',
            type: 'decimal',
            unsigned: true,
            scale: 8,
            width: 40,
            default: 0,
          },
          {
            name: 'withdrawal_pending',
            type: 'decimal',
            unsigned: true,
            scale: 8,
            width: 40,
            default: 0,
          },
          {
            name: 'withdrawal_total',
            type: 'decimal',
            unsigned: true,
            scale: 8,
            width: 40,
            default: 0,
          },
          {
            name: 'deposit_total',
            type: 'decimal',
            unsigned: true,
            scale: 8,
            width: 40,
            default: 0,
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
      process.env.TYPEORM_PREFIX + 'wallet_balance',
      new TableIndex({
        name: 'wallet_balance_wallet_id',
        columnNames: ['wallet_id'],
      })
    );
    await queryRunner.query(`ALTER TABLE ` + tableName + ` ADD CONSTRAINT wallet_id_coin UNIQUE (wallet_id, currency)`);
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`wallet_id`, `currency`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('1001', 'btc', 1557636432024, 1557636432024)`
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`wallet_id`, `currency`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('1001', 'omni.2', 1557636432024, 1557636432024)`
    );
  }
  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'wallet_balance');
  }
}
