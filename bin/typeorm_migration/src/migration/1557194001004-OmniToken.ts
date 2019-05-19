import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class OmniToken1557194001004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'omni_token';
    await queryRunner.createTable(
      new Table({
        name: tableName,
        columns: [
          {
            name: 'symbol',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'property_id',
            type: 'int',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'scale',
            type: 'int',
            default: 0,
          },
          {
            name: 'network',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'created_at',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'bigint',
            isNullable: true,
          },
        ],
      }),
      true
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`symbol`, `name`, `scale`, `property_id`, `network`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('usdt', 'Tether USD', 8, 2, 'testnet', 1557636432024, 1557636432024)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'currency_config';
    await queryRunner.dropTable(tableName);
  }
}
