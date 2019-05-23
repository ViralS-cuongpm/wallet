import { EntityManager, In, LessThan } from 'typeorm';
import { Deposit } from '../entities';
import { CollectStatus } from '../Enums';
import { ICurrency, CurrencyRegistry, Utils } from 'sota-common';
import * as rawdb from './';

/**
 * Return the first bunch of deposit records, which are collectable:
 * - Is still uncollected
 * - Total amount is greater than the collect threshold
 *
 * @param manager
 * @param currencies
 */
export async function findAndUpdateOneGroupOfCollectableDeposits(
  manager: EntityManager,
  currencies: string[]
): Promise<{ walletId: number; currency: ICurrency; records: Deposit[] }> {
  const uncollectStatuses = [CollectStatus.UNCOLLECTED];
  const deltaTime = 10 * 60 * 1000; // 10 minutes
  const { walletId, currency, records } = await findOneGroupOfDeposits(
    manager,
    currencies,
    uncollectStatuses,
    deltaTime
  );

  if (!currency || !records.length) {
    return { walletId: 0, currency: null, records: [] };
  }

  const finalRecords: Deposit[] = [];
  if (currency.isUTXOBased) {
    finalRecords.push(...records);
  } else {
    const chosenAddress = records[0].toAddress;
    finalRecords.push(...records.filter(deposit => deposit.toAddress === chosenAddress));
  }

  // TODO: Check whether the total value is greater than the threshold here...
  // If the value does not satisfy the condition, update their timestamp and leave as it is
  // We'll check it again next time, hopefully the deposit is enough at that time
  rawdb.updateRecordsTimestamp(manager, Deposit, finalRecords.map(r => r.id));

  return { walletId, currency, records: finalRecords };
}

/**
 * Find all deposit with similar toAddress, walletId and currency property
 * that can be group amount
 * @param manager
 * @param currencies
 * @param statuses
 * @param transferType
 */
export async function findOneGroupOfDeposits(
  manager: EntityManager,
  currencies: string[],
  collectStatuses: CollectStatus[],
  deltaTime?: number
): Promise<{ walletId: number; currency: ICurrency; records: Deposit[] }> {
  // find and filter first group
  const now = Utils.nowInMillis();
  const uncollectedDeposits = await manager.getRepository(Deposit).find({
    order: {
      updatedAt: 'ASC',
    },
    where: {
      currency: In(currencies),
      collectStatus: In(collectStatuses),
      updatedAt: deltaTime ? LessThan(now - deltaTime) : undefined,
    },
  });

  if (!uncollectedDeposits.length) {
    return { walletId: 0, currency: null, records: [] };
  }

  const selectedWalletId = uncollectedDeposits[0].walletId;
  const selectedCurrency = uncollectedDeposits[0].currency;
  const currency = CurrencyRegistry.getOneCurrency(selectedCurrency);

  const records = uncollectedDeposits.filter(deposit => {
    return deposit.walletId === selectedWalletId && deposit.currency === selectedCurrency;
  });

  return { walletId: selectedWalletId, currency, records };
}
