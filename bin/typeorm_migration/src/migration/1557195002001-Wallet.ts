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
            width: 200,
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
      process.env.TYPEORM_PREFIX + 'wallet',
      new TableIndex({
        name: 'wallet_wallet_user_id',
        columnNames: ['user_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'wallet');
  }
}
