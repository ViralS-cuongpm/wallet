import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { TableUnique } from 'typeorm/schema-builder/table/TableUnique';

export class WalletBalance1557195002002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const table = process.env.TYPEORM_PREFIX + 'wallet_balance';
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

    await queryRunner.query(`ALTER TABLE ` + table + ` ADD CONSTRAINT wallet_id_coin UNIQUE (wallet_id, currency)`);
  }
  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'wallet_balance');
  }
}
