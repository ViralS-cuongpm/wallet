import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CurrencyConfig1557194001002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'currency_config';
    await queryRunner.createTable(
      new Table({
        name: tableName,
        columns: [
          {
            name: 'currency',
            type: 'varchar',
            length: '190',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'network',
            type: 'varchar',
          },
          {
            name: 'chain_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'chain_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'average_block_time',
            type: 'int',
          },
          {
            name: 'required_confirmations',
            type: 'int',
          },
          {
            name: 'internal_endpoint',
            type: 'varchar',
          },
          {
            name: 'rpc_endpoint',
            type: 'varchar',
          },
          {
            name: 'rest_endpoint',
            type: 'varchar',
          },
          {
            name: 'explorer_endpoint',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'upper_threshold',
            type: 'decimal',
            unsigned: true,
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'lower_threshold',
            type: 'decimal',
            unsigned: true,
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'middle_threshold',
            type: 'decimal',
            unsigned: true,
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'minimum_collect_amount',
            type: 'decimal',
            unsigned: true,
            precision: 40,
            scale: 8,
            isNullable: true,        
          },
          {
            name: 'hd_path',
            type: 'varchar',
            isNullable: true,
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
        '(`currency`, `network`, `chain_id`, `chain_name`, `average_block_time`, `required_confirmations`, `internal_endpoint`, `rpc_endpoint`, `rest_endpoint`, `explorer_endpoint`, `created_at`, `updated_at`, `hd_path`)' +
        ' VALUES ' +
        `('btc', 'testnet', '', 'Testnet', 30000, 1, 'http://0.0.0.0:47001', '{\"protocol\":\"http\",\"host\":\"192.168.1.204\",\"port\":\"18532\",\"user\":\"admin\",\"pass\":\"1\"}', 'http://192.168.1.203:3001/api', 'http://test.insight.masternode.io:3001', 1557636432024, 1557636432024, "m/44'/0'/0'/0/")`
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`currency`, `network`, `chain_id`, `chain_name`, `average_block_time`, `required_confirmations`, `internal_endpoint`, `rpc_endpoint`, `rest_endpoint`, `explorer_endpoint`, `created_at`, `updated_at`, `hd_path`)' +
        ' VALUES ' +
        `('bch', 'testnet', '', 'Testnet', 30000, 1, 'http://0.0.0.0:47012', '{"protocol":"http","host":"192.168.1.203","port":"8336","user":"admin","pass":"1"}', 'http://192.168.1.203:3006/api', 'http://test.insight.masternode.io:3001', 1557636432024, 1557636432024, "m/44'/145'/0'/0/")`
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`currency`, `network`, `chain_id`, `chain_name`, `average_block_time`, `required_confirmations`, `internal_endpoint`, `rpc_endpoint`, `rest_endpoint`, `explorer_endpoint`, `created_at`, `updated_at` ,`hd_path`)' +
        ' VALUES ' +
        `('ltc', 'testnet', '', 'Testnet', 30000, 1, 'http://0.0.0.0:47014', '{"protocol":"http","host":"192.168.1.203","port":"3701","user":"admin","pass":"1"}', 'http://192.168.1.203:3702/api', 'http://test.insight.masternode.io:3001', 1557636432024, 1557636432024, "m/44'/2'/0'/0/")`
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`currency`, `network`, `chain_id`, `chain_name`, `average_block_time`, `required_confirmations`, `internal_endpoint`, `rpc_endpoint`, `rest_endpoint`, `explorer_endpoint`, `created_at`, `updated_at`, `hd_path`)' +
        ' VALUES ' +
        `('omni.2', 'testnet', '', 'Testnet', 30000, 1, 'http://0.0.0.0:47001', '{\"protocol\":\"http\",\"host\":\"192.168.1.204\",\"port\":\"18532\",\"user\":\"admin\",\"pass\":\"1\"}', 'http://192.168.1.203:3001/api', 'http://test.insight.masternode.io:3001', 1557636432024, 1557636432024, "m/44'/0'/0'/0/")`
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`currency`, `network`, `chain_id`, `chain_name`, `average_block_time`, `required_confirmations`, `internal_endpoint`, `rpc_endpoint`, `rest_endpoint`, `explorer_endpoint`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('eos', 'testnet', '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191', 'Kylin', 15000, 6, 'http://0.0.0.0:47013', '', 'https://api.kylin.alohaeos.com', '', 1557636432024, 1557636432024)`
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`currency`, `network`, `chain_id`, `chain_name`, `average_block_time`, `required_confirmations`, `internal_endpoint`, `rpc_endpoint`, `rest_endpoint`, `explorer_endpoint`, `created_at`, `updated_at`, `hd_path`)' +
        ' VALUES ' +
        `('eth', 'testnet', '4', 'Rinkeby', '6000', '6', 'http://0.0.0.0:47002', '', '', 'https://rinkeby.etherscan.io', '1557636432024', '1557636432024', "m/44'/60'/0'/0/")`
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`currency`, `network`, `chain_name`, `average_block_time`, `required_confirmations`, `internal_endpoint`, `rpc_endpoint`, `rest_endpoint`, `explorer_endpoint`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('xrp', 'testnet', 'Testnet', '3500', '10', 'http://0.0.0.0:47004', '', '', 'https://test.bithomp.com/explorer/', '1557636432024', '1557636432024')`
    );
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`currency`, `network`, `chain_name`, `average_block_time`, `required_confirmations`, `internal_endpoint`, `rpc_endpoint`, `rest_endpoint`, `explorer_endpoint`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('ada', 'testnet', 'Testnet', '6000', '9', 'http://0.0.0.0:47011', '', 'http://192.168.1.204:8090', 'http://192.168.1.204:8100/', '1557636432024', '1557636432024')`
    );    
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'currency_config';
    await queryRunner.dropTable(tableName);
  }
}
