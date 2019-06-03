import { createHash } from "crypto";
import { promises } from "fs";
import * as Const from './Const';
import * as DBUtils from './DBUtils';
import {BigNumber, GatewayRegistry} from 'sota-common'
import { EntityManager } from "typeorm";
import { HotWallet } from "../entities";

// const bch = require('bitcoincashjs'); 
const bchLib = require('bitcore-lib-cash');
const bitcore = require('sota-btc/node_modules/bitcore-lib');
const passwordHash = require('password-hash');
const crypto = require('crypto');
const assert = require('assert');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const bs58check = require('bs58check');
const ethUtil = require('ethereumjs-util');

export function encrypt (msg: string, pass: string) {
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

export async function createAddresses(currency: string, coin: string, amount: number, connection: EntityManager): Promise<string[]> {
  const path = await findPathCurrency(currency);
  const network = await getNetwork(connection);
  const wallet = await DBUtils.findOrCreateWallet(currency, connection);
  const seed = await DBUtils.getSeeder(currency, connection);        
  if (!seed) {
    // return [];
    throw new Error ('This currency do not have wallet')
  }
  const count = await DBUtils.countAddresses(currency, connection);
  const hotWallet = await createHotWallet(wallet.id, seed, currency, network, connection, path);
  return await createAndSaveAddresses(wallet.id, seed, coin, count, amount, network, currency, connection);
}


export async function createAndSaveAddresses(walletId: number, seeder: string, coin: string, index: number, amount: number, 
  network: string, currency: string, connection: EntityManager): Promise<string[]> {
    const newIndex = calIndex(index);
    let type = 0x6f;
    if (network.toLocaleLowerCase() === "mainnet") {
      type = 0x00;
    }
    const seed = await bip39.mnemonicToSeed(seeder); //creates seed buffer
    const root = hdkey.fromMasterSeed(seed);
    let listAddresses: Array<string> = [];
    let listPrivateKey: Array<string> = [];
    const path = await findPathCurrency(currency);    
    for (let i = newIndex; i < (newIndex + amount); i++) {
      const addrnode = root.derive(path + i.toString());
      const step1 = addrnode._publicKey;
      let privateKey = addrnode._privateKey.toString('hex');
      const gateway = await GatewayRegistry.getGatewayInstance(currency);
      const address = await gateway.getAccountFromPrivateKey(privateKey);
      listPrivateKey.push(address.privateKey);
      listAddresses.push(address.address);
    }
    await DBUtils.saveAddresses(walletId, listAddresses, currency, listPrivateKey, path, connection);
    return listAddresses
}

export async function createHotWallet(walletId: number, seeder: string, currency: string, network: string, connection: EntityManager, path: string) {
  let type = 0x6f;
  if (network.toLocaleLowerCase() === "mainnet") {
    type = 0x00;
  }
  const seed = await bip39.mnemonicToSeed(seeder); //creates seed buffer
  const root = hdkey.fromMasterSeed(seed);
  const addrnode = root.derive(path + Const.indexOfHotWallet.toString());
  const step1 = addrnode._publicKey;
  let privateKey = addrnode._privateKey.toString('hex');
  const gateway = await GatewayRegistry.getGatewayInstance(currency);
  const address = await gateway.getAccountFromPrivateKey(privateKey);
  privateKey = address.privateKey;
  await DBUtils.saveHotWallet(path, address.address, privateKey, currency, walletId, connection);
}

export async function calPrivateKeyHotWallet (address: string, currency: string, connection: EntityManager) {
  const secretHotWallet = await DBUtils.findSecretHotWallet(address, currency, connection);     
  return decrypt(secretHotWallet, 'amanpuri');
}

function calIndex(number: number) {
  return number + 100;
}

// export async function checkPassword(pass: string, currency: string, connection: EntityManager) {
//   if (await DBUtils.checkPasswordDB(currency, pass, connection)) {
//     return true;
//   }
//   return false;
// }

// export async function checkPrivateKey(currency: string, connection: EntityManager) {
//   if (await DBUtils.checkPrivateKeyDB(currency, connection)) {
//     return true;
//   }
//   return false;
// }

// export async function validatePrivateKey(currency: string, pass: string, masterPrivateKey: string, connection: EntityManager) {
//   const seed = await DBUtils.getPrivateKey(currency, connection);    
//   const seeder = decrypt(seed.seed, pass);
//   if (seeder.toString() !== (await bip39.mnemonicToSeed(masterPrivateKey)).toString('hex')) {
//     return false;
//   }
//   return true;
// }

export async function approveTransaction(toAddress: string, amount: number, coin: string, currency: string, connection: EntityManager) {
  const wallet = await DBUtils.findOrCreateWallet(currency, connection);
  const balance = await DBUtils.findWalletBalance(wallet.id, coin, connection);
  if (!balance) {
    return null;
  }
  if (new BigNumber(balance.balance).isGreaterThanOrEqualTo(amount)) {
    const withdrawalId = await DBUtils.insertWithdrawalRecord(wallet.id, toAddress, amount, coin, connection);
    await DBUtils.insertBalance(wallet.id, withdrawalId, coin, amount, connection);
    return withdrawalId;
  }
  return 'amount greater than balance'
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

export async function findPathCurrency(currency: string) {
  switch (currency) {
    case 'btc': {
      return "m/44'/0'/0'/0/";      
    }
    case 'ltc': {
      return "m/44'/2'/0'/0/";
    }
    case 'bch': {
      return "m/44'/145'/0'/0/";
    }    
    default: { //eth
      return "m/44'/60'/0'/0/";
    }  
  }
}





