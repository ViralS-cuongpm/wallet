import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class WalletLog1557195002003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: process.env.TYPEORM_PREFIX + 'wallet_log',
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
            name: 'wallet_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
            width: 200,
          },
          {
            name: 'event',
            type: 'varchar',
            isNullable: false,
            width: 30,
          },
          {
            name: 'balance_change',
            type: 'decimal',
            width: 50,
            scale: 18,
          },
          {
            name: 'metadata',
            type: 'varchar',
            width: 255,
          },
          {
            name: 'ref_id',
            type: 'bigint',
            isNullable: false,
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
      process.env.TYPEORM_PREFIX + 'wallet_log',
      new TableIndex({
        name: 'wallet_log_wallet_id',
        columnNames: ['wallet_id'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'wallet_log',
      new TableIndex({
        name: 'wallet_log_ref_id',
        columnNames: ['ref_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'wallet_log', 'wallet_log_wallet_id');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'wallet_log', 'wallet_log_ref_id');
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'wallet_log');
  }
}
