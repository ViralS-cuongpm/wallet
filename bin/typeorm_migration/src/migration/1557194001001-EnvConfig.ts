import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class EnvConfig1557194001001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: process.env.TYPEORM_PREFIX + 'env_config',
        columns: [
          {
            name: 'key',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'varchar',
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
      process.env.TYPEORM_PREFIX + 'env_config',
      new TableIndex({
        name: 'env_config_key',
        columnNames: ['key'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropIndex(process.env.TYPEORM_PREFIX + 'env_config', 'env_config_key');
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'env_config');
  }
}
