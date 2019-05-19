import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class WithdrawalTx1557195004002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: process.env.TYPEORM_PREFIX + 'withdrawal_tx',
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
            name: 'wallet_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'hot_wallet_address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'txid',
            type: 'varchar',
            width: 100,
            isUnique: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
            width: 200,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            width: 20,
          },
          {
            name: 'unsigned_txid',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
            width: 100,
          },
          {
            name: 'block_number',
            type: 'bigint',
          },
          {
            name: 'block_hash',
            type: 'varchar',
            width: 100,
          },
          {
            name: 'block_timestamp',
            type: 'bigint',
          },
          {
            name: 'fee_amount',
            type: 'decimal',
            width: 50,
            scale: 18,
          },
          {
            name: 'fee_currency',
            type: 'varchar',
          },
          {
            name: 'unsigned_raw',
            type: 'text',
          },
          {
            name: 'signed_raw',
            type: 'text',
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
      process.env.TYPEORM_PREFIX + 'withdrawal_tx',
      new TableIndex({
        name: 'withdrawal_tx_hot_wallet_address',
        columnNames: ['hot_wallet_address'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'withdrawal_tx',
      new TableIndex({
        name: 'withdrawal_tx_created_at',
        columnNames: ['created_at'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'withdrawal_tx',
      new TableIndex({
        name: 'withdrawal_tx_updated_at',
        columnNames: ['updated_at'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'withdrawal_tx', 'withdrawal_tx_hot_wallet_address');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'withdrawal_tx', 'withdrawal_tx_created_at');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'withdrawal_tx', 'withdrawal_tx_updated_at');
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'withdrawal_tx');
  }
}
