import * as Const from './Const';
import * as DBUtils from './DBUtils';
import { BigNumber, GatewayRegistry, Account, Utils } from 'sota-common';
import { EntityManager } from 'typeorm';
import { indexOfHotWallet } from './Const';

const crypto = require('crypto');
const bip39 = require('bip39');
const hdkey = require('hdkey');

export function encrypt(msg: string, pass: string) {
  const key = crypto.scryptSync(pass, 'salt', 24);
  const cipher = crypto.createCipheriv(Const.algorithm, key, Const.iv);
  return cipher.update(msg, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(encrypted: string, pass: string) {
  const key = crypto.scryptSync(pass, 'salt', 24);
  const decipher = crypto.createDecipheriv(Const.algorithm, key, Const.iv);
  const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted.toString('hex');
}

export async function createAddresses(
  currency: string,
  coin: string,
  amount: number,
  connection: EntityManager
): Promise<string[]> {
  const path = await findPathCurrency(currency, connection);
  const network = await getNetwork(connection);
  const wallet = await DBUtils.findOrCreateWallet(currency, connection);
  const seed = wallet.secret;
  if (!seed) {
    throw new Error('This currency do not have wallet');
  }
  await createHotWallet(wallet.id, seed, currency, network, connection, path);
  const count = await DBUtils.countAddresses(currency, connection);
  return await createAndSaveAddresses(wallet.id, seed, count, amount, network, currency, connection);
}

export async function createAndSaveAddresses(
  walletId: number,
  seeder: string,
  index: number,
  amount: number,
  network: string,
  currency: string,
  connection: EntityManager
): Promise<string[]> {
  const newIndex = calIndex(index);
  if (network.toLocaleLowerCase() === 'mainnet') {
    console.error(`Utils::createAndSaveAddresses TODO: implement me...`);
  }
  const seed = await bip39.mnemonicToSeed(seeder); // creates seed buffer
  const listPairs: Account[] = [];
  const path = await findPathCurrency(currency, connection);
  for (let i = newIndex; i < newIndex + amount; i++) {
    listPairs.push(await createAnAddress(seed, path, i, currency));
  }
  await DBUtils.saveAddresses(walletId, currency, listPairs, path, connection);
  return listPairs.map(pair => pair.address);
}

export async function createAnAddress(seed: Buffer, path: string, index: number, currency: string) {
  const root = hdkey.fromMasterSeed(seed);
  const addrnode = root.derive(path + index.toString());
  const privateKey = addrnode._privateKey.toString('hex');
  const gateway = await GatewayRegistry.getGatewayInstance(currency);
  return await gateway.getAccountFromPrivateKey(privateKey);
}

export async function createHotWallet(
  walletId: number,
  seeder: string,
  currency: string,
  network: string,
  connection: EntityManager,
  path: string
) {
  if (network.toLocaleLowerCase() === 'mainnet') {
    console.error(`Utils::createHotWallet TODO: implement me...`);
  }
  const seed = await bip39.mnemonicToSeed(seeder); // creates seed buffer
  await DBUtils.saveHotWallet(
    path,
    await createAnAddress(seed, path, indexOfHotWallet, currency),
    currency,
    walletId,
    connection
  );
}

export async function calPrivateKeyHotWallet(
  address: string,
  currency: string,
  connection: EntityManager
): Promise<string> {
  const secretHotWallet = await DBUtils.findSecretHotWallet(address, currency, connection);
  return secretHotWallet;
}

function calIndex(number: number) {
  return number + 100;
}

export async function approveTransaction(
  toAddress: string,
  amount: number,
  coin: string,
  currency: string,
  connection: EntityManager
) {
  const wallet = await DBUtils.findOrCreateWallet(currency, connection);
  const balance = await DBUtils.findWalletBalance(wallet.id, coin, connection);
  if (!balance) {
    throw new Error('Dont have wallet of this currency');
  }
  if (!new BigNumber(amount).isGreaterThan(0)) {
    throw new Error('amount greater than 0');
  }  
  // if (!isNormalInteger(amount.toString())) {
  //   throw new Error('amount is not positive integer');
  // }
  if (new BigNumber(amount).isGreaterThan(balance.balance)) {
    throw new Error('amount greater than balance');
  }
  const withdrawalId = await DBUtils.insertWithdrawalRecord(wallet.id, toAddress, amount, coin, connection);
  if (!withdrawalId) {
    return null;
  }
  await DBUtils.insertBalance(wallet.id, withdrawalId, coin, amount, connection);
  return withdrawalId;
}
function isNormalInteger(str: any) {
  let n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}
export async function findId(id: number, connection: EntityManager) {
  return DBUtils.findIdDB(id, connection);
}

export async function findTxHash(id: number, connection: EntityManager) {
  return DBUtils.findTxHashDB(id, connection);
}

export async function getNetwork(connection: EntityManager) {
  return DBUtils.getNetworkDB(connection);
}

export async function findPathCurrency(currency: string, connection: EntityManager) {
  return DBUtils.findHdPathDB(currency, connection);
}

export async function saveThreshold(listInfos: any[], mailerReceive: string, manager: EntityManager) {
  await Utils.PromiseAll([
    DBUtils.saveMailerReceive(mailerReceive, manager), 
    await Utils.PromiseAll(listInfos.map(async info => {
      if (!info.currency || !info.upperThreshold || !info.lowerThreshold) {
        throw new Error('Bad params!');
      }
      await DBUtils.saveCurrencyThresholdInfor(info.currency, info.lowerThreshold, info.upperThreshold, manager);
    }))
  ])
}

export async function getSettingThreshold(connection: EntityManager) {
  return DBUtils.getSettingThresholdDB(connection);
}

export async function validateAddress(currency: string, address: string) {
  if (await (await GatewayRegistry.getGatewayInstance(currency)).isValidAddressAsync(address)) {
    return true;
  }
  return false;
}
