import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import * as encrypt from '../service/encypt'
const passwordHash = require('password-hash');

export class HotWallet1557195002004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const tableName = process.env.TYPEORM_PREFIX + 'hot_wallet';
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
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'wallet_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: false,
            length: '200',
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
            length: '200',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'secret',
            type: 'text',
          },
          {
            name: 'balance',
            type: 'decimal',
            unsigned: true,
            precision: 40,
            scale: 8,
            default: 0,
          },
          {
            name: 'is_external',
            type: 'tinyint',
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
    await queryRunner.createIndex(
      tableName,
      new TableIndex({
        name: 'wallet_hot_wallet_user_id',
        columnNames: ['user_id'],
      })
    );
    await queryRunner.createIndex(
      tableName,
      new TableIndex({
        name: 'wallet_hot_wallet_wallet_id',
        columnNames: ['wallet_id'],
      })
    );
    const eosEncrypted = encrypt.encrypt('c25efe39-c4d8-4831-8acb-0c1d868d62bd', 'amanpuri');
    const xrpEncrypted = encrypt.encrypt('sss8zr4GUwHheKWzBwSnuiRTES3QC', 'amanpuri');

    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`user_id`, `wallet_id`, `address`, `currency`, `secret`, `type`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('1', '1002', 'testamanpuri', 'eos', '${eosEncrypted}', 'normal', 1557636432024, 1557636432024)`
    );    
    await queryRunner.query(
      `INSERT INTO ${tableName} ` +
        '(`user_id`, `wallet_id`, `address`, `currency`, `secret`, `type`, `created_at`, `updated_at`)' +
        ' VALUES ' +
        `('1', '1004', 'r91YMzJfKd3QKJXsU99RkeY9hte63RcLXc', 'xrp', '${xrpEncrypted}', 'normal', 1557636432024, 1557636432024)`
    );       
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(process.env.TYPEORM_PREFIX + 'hot_wallet');
  }
}
