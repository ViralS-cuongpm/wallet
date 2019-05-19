import { EntityManager } from 'typeorm';
import { WalletLog, Wallet } from '../entities';
import { Utils } from 'sota-common';

export async function insertWalletLog(manager: EntityManager, data: any): Promise<void> {
  data.createdAt = Utils.nowInMillis();
  data.updatedAt = Utils.nowInMillis();
  const util = require('util');
  console.log(`>>>>>>>>>>>>>>>>>>>> Insert wallet log: ${util.inspect(data)}`);
  const record = new WalletLog();
  record.walletId = data.walletId;
  record.currency = data.currency;
  record.event = data.event;
  record.balanceChange = data.balanceChange.toString();
  record.refId = data.refId;
  record.createdAt = data.createdAt;
  record.updatedAt = data.updatedAt;

  await manager.getRepository(WalletLog).save(record);
  return;
}

export default insertWalletLog;
