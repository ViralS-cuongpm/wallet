import { getLogger, BasePlatformWorker, CurrencyRegistry, GatewayRegistry, AccountBasedGateway } from 'sota-common';
import { getConnection, EntityManager } from 'typeorm';
import * as rawdb from '../../rawdb';
import { InternalTransferType, WithdrawalStatus } from '../../Enums';
import { Address, WalletBalance } from '../../entities';
import { InternalTransfer } from '../../entities/InternalTransfer';

const logger = getLogger('feeSeederDoProcess');

export async function feeSeederDoProcess(seeder: BasePlatformWorker): Promise<void> {
  await getConnection().transaction(async manager => {
    await _feeSeederDoProcess(manager, seeder);
  });
}

/**
 * This process will select deposits that satisfy:
 * - Status is uncollected
 * - Is not native coin
 * If there's no record, just return
 * After that check the actual balance of deposit address. If it's insufficient for
 * constructing collecting transaction, send seeding fee to it
 * If there's no hot wallet that is sufficient, also just return
 *
 * @param manager
 * @param seeder
 */
async function _feeSeederDoProcess(manager: EntityManager, seeder: BasePlatformWorker): Promise<void> {
  const platformCurrency = seeder.getCurrency();
  const platformCurrencies = CurrencyRegistry.getCurrenciesOfPlatform(platformCurrency.platform);
  const allSymbols = platformCurrencies.map(c => c.symbol);

  // const { walletId, currency, records } = await rawdb.findOneGroupOfDepositsNeedSeedingFee(manager, allSymbols);
  // if (currency.isUTXOBased) {
  //   throw new Error(`Something went wrong. UTXO-base currency does not need to be seeded...`);
  // }

  // const gateway = GatewayRegistry.getGatewayInstance(currency);

  // if (seeder.requests.length === 0) {
  //   logger.info('No Seed Request');
  //   return emptyResult;
  // }

  // const feeSeederCurrency = getFamily();
  // const request = seeder.requests.shift();
  // const { toAddress, amount, depositId } = request;

  // const feeAmount = amount;
  // const seeded = await manager.getRepository(InternalTransfer).findOne({
  //   toAddress,
  //   status: WithdrawalStatus.SENT,
  //   type: InternalTransferType.SEED,
  //   currency: feeSeederCurrency,
  // });
  // if (seeded) {
  //   logger.info(`${depositId} is seeded previously`);
  //   return emptyResult;
  // }

  // const address = await manager.getRepository(Address).findOne({ address: toAddress });
  // if (!address) {
  //   logger.error(`${toAddress} is not a deposit address`);
  //   return emptyResult;
  // }

  // const walletId = address.walletId;
  // // Find internal hot wallet to seed fee for funds collector
  // const hotWallet = await rawdb.findSufficientHotWallet(
  //   manager,
  //   walletId,
  //   [{ toAddress, amount: feeAmount } as any],
  //   feeSeederCurrency,
  //   false,
  //   seeder.getGateway()
  // );
  // if (!hotWallet) {
  //   logger.error(`No transferable internal hot wallet walletId=${walletId} currency=${feeSeederCurrency}`);
  //   return emptyResult;
  // }

  // const walletBalance = await manager.getRepository(WalletBalance).findOne({ walletId, currency: feeSeederCurrency });
  // if (!walletBalance) {
  //   logger.error(`Wallet ${walletId} is missed wallet balance record`);
  //   return emptyResult;
  // }

  // const feeWalletBalance = walletBalance.balance;
  // if (new BigNumber(feeWalletBalance).lt(feeAmount)) {
  //   logger.error(
  //     `Wallet ${walletId} has not enough ${feeSeederCurrency.toUpperCase()} fund to seed fee for address=${
  //       address.address
  //     }`
  //   );
  //   return emptyResult;
  // }

  // const rawPrivateKey = await hotWalletToPrivateKey(hotWallet);
  // const tx = await seeder.getGateway().seedFee(rawPrivateKey, hotWallet.address, toAddress, feeAmount);

  // const internalTransferRecord = new InternalTransfer();
  // internalTransferRecord.currency = feeSeederCurrency;
  // internalTransferRecord.walletId = hotWallet.walletId;
  // internalTransferRecord.fromAddress = 'will remove this field'; // remove
  // internalTransferRecord.toAddress = 'will remove this field'; // remove
  // internalTransferRecord.type = InternalTransferType.SEED;
  // internalTransferRecord.txid = tx.txid;
  // internalTransferRecord.status = WithdrawalStatus.SENT;

  // await rawdb.insertInternalTransfer(manager, internalTransferRecord);

  // logger.info(`Seed Successfully address=${toAddress}`);

  // return emptyResult;
}
