import { createHash } from "crypto";
import { saveAddresses, getPrivateKey, saveMasterPrivateKey, createWallet, saveHotWallet} from './DBUtils'
import { promises } from "fs";

const crypto = require('crypto');
const assert = require('assert');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const bs58check = require('bs58check');
const algorithm = 'aes-192-cbc';
const iv = Buffer.alloc(16, 0);
const path = "m/44'/0'/0'/0/";
const indexOfHotWallet = 0;


function encrypt (msg: string, pass: string) {
  const key = crypto.scryptSync(pass, 'salt', 24);  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(msg, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(encrypted: string, pass: string) {
  const key = crypto.scryptSync(pass, 'salt', 24);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted.toString('hex');
}

export async function createAddress(pass: string, currency: string, index: number, amount: number, network: string, userId: number): Promise<object> {
    const seed = await getPrivateKey(currency, pass, userId.toString());        
    if (!seed.seed) {
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
    for (let i = newIndex; i < (newIndex + amount); i++) {
      const addrnode = root.derive(path + i.toString());
      const step1 = addrnode._publicKey;
      const step2 = createHash('sha256').update(step1).digest();
      const step3 = createHash('rmd160').update(step2).digest();
      var step4 = Buffer.allocUnsafe(21);
      step4.writeUInt8(type, 0);
      step3.copy(step4, 1); //step4 now holds the extended RIPMD-160 result
      const step9 = bs58check.encode(step4);      
      listAddresses.push(step9);        
    }
    const walletId = await createWallet(currency, userId);
    await saveAddresses(listAddresses, walletId, currency, newIndex, path);
    return {
      addresses: listAddresses,
      index: index,
      amount: amount
    }
}

export async function initWallet(pass: string, privateKey: string, currency: string, userId: number) {
  const network = 'testnet';
  let type = 0x6f;
  if (network.toLocaleLowerCase() === "mainnet") {
    type = 0x00;
  }
  const mnemonic = privateKey;
  const seed = await bip39.mnemonicToSeed(mnemonic); //creates seed buffer
  const root = hdkey.fromMasterSeed(seed);
  const addrnode = root.derive(path + indexOfHotWallet.toString());

  const step1 = addrnode._publicKey;
  const step2 = createHash('sha256').update(step1).digest();
  const step3 = createHash('rmd160').update(step2).digest();
  var step4 = Buffer.allocUnsafe(21);
  step4.writeUInt8(type, 0);
  step3.copy(step4, 1); //step4 now holds the extended RIPMD-160 result
  const step9 = bs58check.encode(step4);

  const walletId = await createWallet(currency, userId);
  await saveHotWallet(walletId, userId, step9, currency);
  await saveMasterPrivateKey(await encrypt(seed.toString('hex'), pass), currency, userId.toString(), walletId.toString());
}

export async function calPrivateKey (pass: string, index: number, currency: string, userId: number, network: string) {
  const seed = await getPrivateKey(currency, pass, userId.toString());     
  if (!seed.seed) {
    return null;
  }
  const newIndex = calIndex(index);
  const seeder = decrypt(seed.seed, pass)
  let type = 0x6f;
  if (network.toLocaleLowerCase() === "mainnet") {
    type = 0x00;
  }
  const root = await hdkey.fromMasterSeed(Buffer.from(seeder, 'hex'));  
  const addrnode = root.derive(path + newIndex.toString());
  const step1 = addrnode._privateKey;
  const step2 = createHash('sha256').update(step1).digest();
  const step3 = createHash('rmd160').update(step2).digest();
  var step4 = Buffer.allocUnsafe(21);
  step4.writeUInt8(type, 0);
  step3.copy(step4, 1); //step4 now holds the extended RIPMD-160 result
  const step9 = bs58check.encode(step4);      
  return step9;
}

function calIndex(number: number) {
  if (number === 0) {
    return number;
  }
  return number + 100;
}




