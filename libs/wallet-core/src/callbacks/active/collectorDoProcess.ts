import {
  getLogger,
  Utils,
  ISignedRawTransaction,
  BasePlatformWorker,
  CurrencyRegistry,
  IRawTransaction,
  GatewayRegistry,
  UTXOBasedGateway,
  IBoiledVIn,
  BitcoinBasedGateway,
} from 'sota-common';
import BN from 'bignumber.js';
import { EntityManager, getConnection, In } from 'typeorm';
import * as rawdb from '../../rawdb';
import { CollectStatus, InternalTransferType, WithdrawalStatus } from '../../Enums';
import { Deposit, Address, InternalTransfer, HotWallet } from '../../entities';
import Kms from '../../encrypt/Kms';
import _ = require('lodash');

const logger = getLogger('collectorDoProcess');

export async function collectorDoProcess(collector: BasePlatformWorker): Promise<void> {
  await getConnection().transaction(async manager => {
    await _collectorDoProcess(manager, collector);
  });
}

/**
 * Tasks of collector:
 * - Find uncollected deposits
 *   + If the deposit currency is account-based, just take 1 record
 *   + If the deposit currency is utxo-based, take multiple records
 * - If the deposit amount is too small, just skip. We'll wait until the funds is big enough
 * - Find an internal hot wallet
 * - Send fee to deposit address if needed to collect tokens (ERC20, USDT, ...)
 * - Make transaction that transfer funds from deposit addresses to the hot wallet
 *
 * @param manager
 * @param picker
 * @private
 */
async function _collectorDoProcess(manager: EntityManager, collector: BasePlatformWorker): Promise<void> {
  const platformCurrency = collector.getCurrency();
  const platformCurrencies = CurrencyRegistry.getCurrenciesOfPlatform(platformCurrency.platform);
  const allSymbols = platformCurrencies.map(c => c.symbol);

  const { walletId, currency, records } = await rawdb.findAndUpdateOneGroupOfCollectableDeposits(manager, allSymbols);

  if (!walletId || !currency || !records.length) {
    logger.info(`There're no uncollected deposit right now. Will try to process later...`);
    return;
  }

  const hotWallet = await rawdb.findAnyInternalHotWallet(manager, walletId, currency.symbol);
  const rawTx: IRawTransaction = currency.isUTXOBased
    ? await _constructUtxoBasedCollectTx(records, hotWallet.address)
    : await _constructAccountBasedCollectTx(records[0], hotWallet.address);
}

async function _constructUtxoBasedCollectTx(deposits: Deposit[], toAddress: string): Promise<IRawTransaction> {
  const currency = CurrencyRegistry.getOneCurrency(deposits[0].currency);
  const gateway = GatewayRegistry.getGatewayInstance(currency) as BitcoinBasedGateway;
  const vins: IBoiledVIn[] = [];
  const depositAddresses: string[] = [];

  await Utils.PromiseAll(
    deposits.map(async deposit => {
      const depositAddress = deposit.toAddress;
      if (depositAddresses.indexOf(depositAddress) === -1) {
        depositAddresses.push(depositAddress);
      }

      const depositVouts = await gateway.getOneTxVouts(deposit.txid, depositAddress);
    })
  );

  throw new Error(`TODO: Implement me please...`);
}

async function _constructAccountBasedCollectTx(deposit: Deposit, toAddress: string): Promise<IRawTransaction> {
  throw new Error(`TODO: Implement me please...`);
}
