import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { ForeignKeyMetadata } from 'typeorm/metadata/ForeignKeyMetadata';
import { TableUnique } from 'typeorm/schema-builder/table/TableUnique';

export class Deposit1557195003001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: process.env.TYPEORM_PREFIX + 'deposit',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            generationStrategy: 'increment',
            isGenerated: true,
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
            name: 'to_address',
            type: 'varchar',
            isNullable: false,
            width: 150,
          },
          {
            name: 'txid',
            type: 'varchar',
            isNullable: false,
            width: 100,
          },
          {
            name: 'amount',
            type: 'decimal',
            width: 40,
            isNullable: false,
            scale: 8,
          },
          {
            name: 'block_number',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'block_timestamp',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'collect_status',
            type: 'varchar',
            width: 20,
            isNullable: false,
            default: `'uncollected'`,
          },
          {
            name: 'collected_txid',
            type: 'varchar',
            width: 100,
            isNullable: true,
          },
          {
            name: 'collected_timestamp',
            type: 'bigint',
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
    const table_name = process.env.TYPEORM_PREFIX + 'deposit';
    await queryRunner.query(`ALTER TABLE ` + table_name + ` ALTER collect_status SET DEFAULT "uncollected"`);
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'deposit',
      new TableIndex({
        name: 'deposit_wallet_id',
        columnNames: ['wallet_id'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'deposit',
      new TableIndex({
        name: 'deposit_to_address',
        columnNames: ['to_address'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'deposit',
      new TableIndex({
        name: 'deposit_collected_txid',
        columnNames: ['collected_txid'],
      })
    );
    const table = process.env.TYPEORM_PREFIX + 'deposit';
    await queryRunner.query(`ALTER TABLE ` + table + ` ADD CONSTRAINT uniqueName UNIQUE (txid, to_address, currency)`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'deposit');
  }
}
