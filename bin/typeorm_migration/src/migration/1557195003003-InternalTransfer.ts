import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InternalTransfer1557195003003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'internal_transfer';
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
            name: 'from_address',
            type: 'varchar',
            width: 150,
          },
          {
            name: 'to_address',
            type: 'varchar',
            isPrimary: true,
            width: 150,
          },
          {
            name: 'type',
            type: 'varchar',
            width: 20,
          },
          {
            name: 'txid',
            type: 'varchar',
            width: 150,
          },
          {
            name: 'amount',
            type: 'decimal',
            unsigned: true,
            scale: 8,
            width: 40,
            default: 0,
          },
          {
            name: 'fee',
            type: 'decimal',
            unsigned: true,
            scale: 8,
            width: 40,
            default: 0,
          },
          {
            name: 'fee_currency',
            type: 'varchar',
            width: 200,
          },
          {
            name: 'status',
            type: 'varchar',
            width: 20,
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
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'internal_transfer';
    await queryRunner.dropTable(tableName);
  }
}
