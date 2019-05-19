import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Wallet1557195002001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: process.env.TYPEORM_PREFIX + 'wallet',
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
            type: 'int',
            isNullable: false,
            width: 255,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
            width: 10,
          },
          {
            name: 'delegate_address',
            type: 'varchar',
            isNullable: false,
            width: 200,
          },
          {
            name: 'meta',
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
      process.env.TYPEORM_PREFIX + 'wallet',
      new TableIndex({
        name: 'wallet_wallet_user_id',
        columnNames: ['user_id'],
      })
    );
    const table_name = process.env.TYPEORM_PREFIX + 'wallet';
    await queryRunner.query(
      `ALTER TABLE ` + table_name + ` ALTER delegate_address SET DEFAULT "SET_VALID_ADDRESS_HERE"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'wallet', 'wallet_wallet_user_id');
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'wallet');
  }
}
