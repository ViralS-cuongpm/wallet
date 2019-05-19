import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Withdrawal1557195004001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: process.env.TYPEORM_PREFIX + 'withdrawal',
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
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'withdrawal_tx_id',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'txid',
            type: 'varchar',
            width: 200,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
            width: 10,
          },
          {
            name: 'from_address',
            type: 'varchar',
            isNullable: false,
            width: 100,
          },
          {
            name: 'to_address',
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
            name: 'amount',
            type: 'decimal',
            isNullable: false,
            width: 50,
            scale: 18,
          },
          {
            name: 'hash_check',
            type: 'varchar',
            isNullable: false,
            width: 255,
          },
          {
            name: 'kms_data_key_id',
            type: 'int',
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
    const table_name = process.env.TYPEORM_PREFIX + 'withdrawal';
    await queryRunner.query(`ALTER TABLE ` + table_name + ` ALTER txid SET DEFAULT ""`);
    await queryRunner.query(`ALTER TABLE ` + table_name + ` ALTER from_address SET DEFAULT ""`);
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'withdrawal',
      new TableIndex({
        name: 'withdrawal_user_id',
        columnNames: ['user_id'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'withdrawal',
      new TableIndex({
        name: 'withdrawal_wallet_id',
        columnNames: ['wallet_id'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'withdrawal',
      new TableIndex({
        name: 'withdrawal_withdrawal_tx_id',
        columnNames: ['withdrawal_tx_id'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'withdrawal',
      new TableIndex({
        name: 'withdrawal_from_address',
        columnNames: ['from_address'],
      })
    );
    await queryRunner.createIndex(
      process.env.TYPEORM_PREFIX + 'withdrawal',
      new TableIndex({
        name: 'withdrawal_to_address',
        columnNames: ['to_address'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'withdrawal', 'withdrawal_user_id');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'withdrawal', 'withdrawal_wallet_id');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'withdrawal', 'withdrawal_withdrawal_tx_id');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'withdrawal', 'withdrawal_from_address');
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'withdrawal', 'withdrawal_to_address');
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'withdrawal');
  }
}
