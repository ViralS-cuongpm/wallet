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
            name: 'sub_currency',
            type: 'varchar',
            isNullable: false,
            width: 10,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
            width: 10,
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
            width: 32,
            isNullable: false,
            scale: 0,
          },
          {
            name: 'collect_status',
            type: 'varchar',
            width: 20,
            isNullable: false,
          },
          {
            name: 'collected_txid',
            type: 'varchar',
            width: 100,
          },
          {
            name: 'collected_timestamp',
            type: 'bigint',
          },
          {
            name: 'next_check_at',
            type: 'bigint',
            isNullable: false,
            default: 0,
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
    // await queryRunner.query(`DROP INDEX deposit_wallet_id ON ` + table_name);
    // await queryRunner.query(`DROP INDEX deposit_to_address ON ` + table_name);
    // await queryRunner.query(`DROP INDEX deposit_next_check_at ON ` + table_name);
    // await queryRunner.query(`DROP INDEX deposit_collected_txid ON ` + table_name);
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
        name: 'deposit_next_check_at',
        columnNames: ['next_check_at'],
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
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'deposit', 'deposit_wallet_id');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'deposit', 'deposit_to_address ');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'deposit', 'deposit_next_check_at');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'deposit', 'deposit_collected_txid');
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'deposit');
  }
}
