import { createHash } from "crypto";
import { EntityManager, In, LessThan, Not } from 'typeorm';
import { MasterPrivateKey, Wallet, Address } from '../entity';
import { createConnection, getConnection } from 'wallet-core/node_modules/typeorm';

const crypto = require('crypto');
const assert = require('assert');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const bs58check = require('bs58check');
const algorithm = 'aes-192-cbc';
const iv = Buffer.alloc(16, 0);

function encrypt (msg: string, pass: string) {
  const key = crypto.scryptSync(pass, 'salt', 24);  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(msg, 'utf8', 'hex') + cipher.final('hex');
}
export function decrypt(encrypted: string, pass: string) {
  const key = crypto.scryptSync(pass, 'salt', 24);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted.toString('hex');
}
export async function createAddress(pass: string, currency: string, index: number, amount: number): Promise<object> {
    const seed = await getPrivateKey(currency, pass, currency);
    if (!seed) {
      return null;
    }
    const root = hdkey.fromMasterSeed(new Buffer(seed, 'hex'));
    const masterPrivateKey = root.privateKey.toString('hex');
    let listAddresses: Array<string> = [];
      for(let i = index; i < (index + amount); i++) {
        const addrnode = root.derive("m/44'/0'/0'/0/" + i.toString());
        const step1 = addrnode._publicKey;
        const step2 = createHash('sha256').update(step1).digest();
        const step3 = createHash('rmd160').update(step2).digest();
        var step4 = Buffer.allocUnsafe(21);
        step4.writeUInt8(0x6f, 0);
        step3.copy(step4, 1); //step4 now holds the extended RIPMD-160 result
        const step9 = bs58check.encode(step4);      
        listAddresses.push(step9);
      }     
    const walletId = await createWallet(currency);
    saveAddress(listAddresses, walletId, currency, index);      
    return {
      addresses: listAddresses,
      index: index,
      amount: amount
    }
}
export async function saveAddress(addresses: string[], walletId: number, currency: string, index: number) {
  let count = index;
  addresses.forEach(async address => {
    let newAddress = new Address();
    newAddress.walletId = walletId;
    newAddress.currency = currency;
    newAddress.address = address;
    newAddress.secret = count.toString();
    count ++;
    await getConnection().getRepository(Address).save(newAddress);
  })
}
export async function initWallet(pass: string, privateKey: string, currency: string) {
  const mnemonic = privateKey;
  const seed = await bip39.mnemonicToSeed(mnemonic); //creates seed buffer
  const root = hdkey.fromMasterSeed(seed);
  const masterPrivateKey = root.privateKey.toString('hex');
  saveMasterPrivateKey(await encrypt(seed.toString('hex'), pass), currency, currency);
}
export async function getPrivateKey(currency: string, pass: string, deviceId: string): Promise<string> {
  let masterPrivateKey = await getConnection().getRepository(MasterPrivateKey).findOne({
    where: {
      currency: currency,
      deviceid: deviceId
    }
  })  
  if(masterPrivateKey) {
    return decrypt(masterPrivateKey.encrypted, pass);
  }
  return null;
}
export async function createWallet(currency: string) {
  let wallet = await getConnection().getRepository(Wallet).findOne({
    where: {
      currency: currency,
    }
  })
  if(!wallet) {
    wallet = new Wallet();
    wallet.userId = 1;
    wallet.label = currency;
    wallet.currency = currency;
    await getConnection().getRepository(Wallet).save(wallet);
  }  
  return wallet.id;
}
export async function saveMasterPrivateKey(encrypted: string, currency: string, deviceId: string) {
  let masterPrivateKey = await getConnection().getRepository(MasterPrivateKey).findOne({
    where: {
      currency: currency,
      deviceid: deviceId
    }
  })
  if(!masterPrivateKey) {
    masterPrivateKey = new MasterPrivateKey();
    masterPrivateKey.encrypted = encrypted;
    masterPrivateKey.devideId = deviceId;
    masterPrivateKey.currency = currency;
    await getConnection().getRepository(MasterPrivateKey).save(masterPrivateKey);
  }
}