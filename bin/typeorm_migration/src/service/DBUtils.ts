import { EntityManager, In, LessThan, Not } from 'typeorm';
import { MasterPrivateKey } from '../entity';
import { createConnection, getConnection } from 'wallet-core/node_modules/typeorm';
import { Wallet, Address, HotWallet } from 'wallet-core/src/entities';

export async function saveAddress(address: string, walletId: number, currency: string, index: number, path: string) {
  let count = index;
  let newAddress = new Address();
  newAddress.walletId = walletId;
  newAddress.currency = currency;
  newAddress.address = address;
  newAddress.secret = count.toString();
  newAddress.hdPath = path;

  let hotWallet = new HotWallet();
  hotWallet.userId = 1;
  hotWallet.walletId = walletId;
  hotWallet.address = address;
  hotWallet.currency = currency;
  hotWallet.secret = count.toString();

  await getConnection().getRepository(Address).save(newAddress);
  await getConnection().getRepository(HotWallet).save(newAddress);
}

export async function saveAddresses(addresses: string[], walletId: number, currency: string, index: number, path: string) {
  let count = index;
  addresses.forEach(async address => {
    let newAddress = new Address();
    newAddress.walletId = walletId;
    newAddress.currency = currency;
    newAddress.address = address;
    newAddress.secret = count.toString();
    newAddress.hdPath = path;    
    newAddress.isExternal = false;
    newAddress.isHd = true;
    count ++;
    await getConnection().getRepository(Address).save(newAddress);    
  })
}

export async function getPrivateKey(currency: string, pass: string, deviceId: string) {
  let masterPrivateKey = await getConnection().getRepository(MasterPrivateKey).findOne({
    where: {
      currency: currency,
      deviceid: deviceId
    }
  })  
  if(masterPrivateKey) {
    return {
      walletId: masterPrivateKey.walletId,
      seed: masterPrivateKey.encrypted
    }
  }
  return null;
}

export async function saveMasterPrivateKey(encrypted: string, currency: string, deviceId: string, walletId: string) {
  let masterPrivateKey = await getConnection().getRepository(MasterPrivateKey).findOne({
    where: {
      currency: currency,
      deviceid: deviceId
    }
  })
  if(!masterPrivateKey) {
    masterPrivateKey = new MasterPrivateKey();
    masterPrivateKey.walletId = walletId;
    masterPrivateKey.encrypted = encrypted;
    masterPrivateKey.devideId = deviceId;
    masterPrivateKey.currency = currency;
    await getConnection().getRepository(MasterPrivateKey).save(masterPrivateKey);
  }
}

export async function createWallet(currency: string, userId: number) {
  let wallet = await getConnection().getRepository(Wallet).findOne({
    where: {
      currency: currency,
    }
  })
  if(!wallet) {
    wallet = new Wallet();
    wallet.userId = userId;
    wallet.label = currency;
    wallet.currency = currency;
    wallet.secret = "dummy";
    wallet.isHd = true;
    await getConnection().getRepository(Wallet).save(wallet);
  }  
  return wallet.id;
}

export async function saveHotWallet(walletId: number, userId: number, address: string, currency: string) {
  let hotWallet = await getConnection().getRepository(HotWallet).findOne({
    where: {
      userId: userId,
      currency: currency,
      walletId: walletId
    }
  })
  if (!hotWallet) {
    hotWallet = new HotWallet();
    hotWallet.userId = userId;
    hotWallet.walletId = walletId;
    hotWallet.address = address;
    hotWallet.currency = currency;
    hotWallet.secret = '0';
    hotWallet.type = 'normal';
    await getConnection().getRepository(HotWallet).save(hotWallet);
  }  
}
