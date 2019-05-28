import { createHash } from "crypto";
import { saveAddresses, getPrivateKey, saveMasterPrivateKey, createWallet, saveHotWallet, checkPrivateKeyDB, checkPasswordDB, findWalletBalance, insertWithdrawalRecord, findIdDB } from './DBUtils'
import { promises } from "fs";
import * as Const from './Const';
import {BigNumber} from 'sota-common'
import { Connection } from "typeorm";

const bitcore = require('sota-btc/node_modules/bitcore-lib');
const passwordHash = require('password-hash');
const crypto = require('crypto');
const assert = require('assert');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const bs58check = require('bs58check');

function encrypt (msg: string, pass: string) {
  const key = crypto.scryptSync(pass, 'salt', 24);  
  const cipher = crypto.createCipheriv(Const.algorithm, key, Const.iv);
  return cipher.update(msg, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(encrypted: string, pass: string) {
  const key = crypto.scryptSync(pass, 'salt', 24);
  const decipher = crypto.createDecipheriv(Const.algorithm, key, Const.iv);
  const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted.toString('hex');
}

export async function createAddress(pass: string, currency: string, index: number, amount: number, 
  network: string, masterPrivateKey: string, connection: Connection): Promise<object> {
    const seed = await getPrivateKey(currency, connection);        
    if (!seed) {
      return null;
    }
    const newIndex = calIndex(index);
    const seeder = decrypt(seed.seed, pass)
    let type = 0x6f;
    if (network.toLocaleLowerCase() === "mainnet") {
      type = 0x00;
    }
    const root = hdkey.fromMasterSeed(new Buffer(seeder, 'hex'));
    let listAddresses: Array<string> = [];
    let listPrivateKey: Array<string> = [];
    for (let i = newIndex; i < (newIndex + amount); i++) {
      const addrnode = root.derive(Const.path + i.toString());
      const step1 = addrnode._publicKey;
      const childPrivateKey = new bitcore.PrivateKey(addrnode._privateKey.toString('hex'), network);
      const address = childPrivateKey.toAddress().toString();
      const privateKey = childPrivateKey.toWIF();
      listPrivateKey.push(privateKey);
      listAddresses.push(address);
    }
    const walletId = await createWallet(currency, connection);
    await saveAddresses(listAddresses, currency, listPrivateKey, Const.path, connection);
    return {
      addresses: listAddresses,
      index: newIndex,
      amount: amount
    }
}

export async function initWallet(pass: string, privateKey: string, currency: string, plaformCurrency: string, network: string, connection: Connection) {
  let type = 0x6f;
  if (network.toLocaleLowerCase() === "mainnet") {
    type = 0x00;
  }
  const mnemonic = privateKey;
  const seed = await bip39.mnemonicToSeed(mnemonic); //creates seed buffer
  const root = hdkey.fromMasterSeed(seed);
  const addrnode = root.derive(Const.path + Const.indexOfHotWallet.toString());

  const step1 = addrnode._publicKey;
  const childPrivateKey = new bitcore.PrivateKey(addrnode._privateKey.toString('hex'), network);
  const address = childPrivateKey.toAddress().toString();
  await createWallet(currency, connection);
  await saveHotWallet(address, plaformCurrency, connection);
  await saveMasterPrivateKey(await encrypt(seed.toString('hex'), pass), currency, pass, connection);
}

export async function calPrivateKey (pass: string, index: number, currency: string, network: string, connection: Connection) {
  const seed = await getPrivateKey(currency, connection);     
  if (!seed.seed) {
    return null;
  }
  const newIndex = index;
  const seeder = decrypt(seed.seed, pass)
  let type = 0x6f;
  if (network.toLocaleLowerCase() === "mainnet") {
    type = 0x00;
  }
  const root = await hdkey.fromMasterSeed(Buffer.from(seeder, 'hex'));  
  const addrnode = root.derive(Const.path + newIndex.toString());
  const step1 = addrnode._privateKey;
  const privateKey = new bitcore.PrivateKey(step1.toString('hex'), network);
  return privateKey.toWIF();
}

function calIndex(number: number) {
  return number + 100;
}

export async function checkPassword(pass: string, currency: string, connection: Connection) {
  if (await checkPasswordDB(currency, pass, connection)) {
    return true;
  }
  return false;
}

export async function checkPrivateKey(currency: string, connection: Connection) {
  if (await checkPrivateKeyDB(currency, connection)) {
    return true;
  }
  return false;
}

export async function validatePrivateKey(currency: string, pass: string, masterPrivateKey: string, connection: Connection) {
  const seed = await getPrivateKey(currency, connection);    
  const seeder = decrypt(seed.seed, pass);
  if (seeder.toString() !== (await bip39.mnemonicToSeed(masterPrivateKey)).toString('hex')) {
    return false;
  }
  return true;
}

export async function approveTransaction(toAddress: string, amount: number, coin: string, currency: string, connection: Connection) {
  const balance = await findWalletBalance(coin, connection);
  if (!balance) {
    return null;
  }
  if (new BigNumber(balance.balance).isGreaterThanOrEqualTo(amount)) {
    return await insertWithdrawalRecord(toAddress, amount, coin, connection);
  }
  return 'amount greater than balance'
}
export async function findId(id: number, connection: Connection) {
  return findIdDB(id, connection);
}




