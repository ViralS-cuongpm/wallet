import { EntityManager, In, LessThan, Not } from 'typeorm';
import { MasterPrivateKey } from '../entity';
import { createConnection, getConnection, Connection } from 'wallet-core/node_modules/typeorm';
import { Wallet, Address, HotWallet, WalletBalance } from 'wallet-core/src/entities';
import { userId, walletId, UNSIGNED, kmsId, indexOfHotWallet, path } from './Const';
import { Withdrawal, WalletLog } from '../../../../libs/wallet-core/src/entities';
import { BigNumber } from 'sota-common';

const passwordHash = require('password-hash');

export async function checkPrivateKeyDB (currency: string, connection: Connection) {
  let masterPrivateKey = await connection.getRepository(MasterPrivateKey).findOne({
    where: {
      currency: currency,      
    }
  }) 
  if (!masterPrivateKey) {
    return false;
  }   
  return true;
}

export async function checkPasswordDB (currency: string, pass: string, connection: Connection) {
  let masterPrivateKey = await connection.getRepository(MasterPrivateKey).findOne({
    where: {
      currency: currency
    }
  }) 
  if (!passwordHash.verify(pass, masterPrivateKey.passwordHash)) {
    return false;
  }   
  return true;
}  

export async function saveAddresses(addresses: string[], currency: string, privateKeys: string[], path: string,connection: Connection) {
  let count = 0;
  addresses.forEach(async address => {
    let newAddress = new Address();
    newAddress.walletId = walletId;
    newAddress.currency = currency;
    newAddress.address = address;
    newAddress.secret = privateKeys[count];
    newAddress.hdPath = path;    
    newAddress.isExternal = false;
    newAddress.isHd = true;
    count ++;
    await connection.getRepository(Address).save(newAddress);    
  })
}

export async function getPrivateKey(currency: string, connection: Connection) {
  let masterPrivateKey = await connection.getRepository(MasterPrivateKey).findOne({
    where: {
      currency: currency,
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

export async function saveMasterPrivateKey(encrypted: string, currency: string, password: string, connection: Connection) {
  const masterPrivateKeyRepo = connection.getRepository(MasterPrivateKey);
  let masterPrivateKey = await masterPrivateKeyRepo.findOne({
    where: {
      currency: currency,
    }
  })
  if(!masterPrivateKey) {
    masterPrivateKey = new MasterPrivateKey();
    masterPrivateKey.walletId = walletId;
    masterPrivateKey.encrypted = encrypted;
    masterPrivateKey.passwordHash = passwordHash.generate(password);
    masterPrivateKey.currency = currency;
    await masterPrivateKeyRepo.save(masterPrivateKey);
  }
}

export async function createWallet(currency: string, connection: Connection) {
  const walletRepo = connection.getRepository(Wallet);
  let wallet = await walletRepo.findOne({
    where: {
      currency: currency,
    }
  })
  if(!wallet) {
    wallet = new Wallet();
    wallet.userId = userId;
    wallet.label = 'Default';
    wallet.currency = currency;
    wallet.secret = "dummy";
    wallet.isHd = true;
    await walletRepo.save(wallet);
  }  
  return wallet.id;
}

export async function saveHotWallet(address: string, currency: string, connection: Connection) {
  const hotWalletRepo = connection.getRepository(HotWallet);
  let hotWallet = await hotWalletRepo.findOne({
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
    await hotWalletRepo.save(hotWallet);
  }  
  const hotWalletaddress = await connection.getRepository(Address).findOne({
    where: {
      address: hotWallet.address,
      walletId: walletId,
      currency: currency,
      userId: userId
    }
  });
  if (!hotWalletaddress) {
    saveAddresses([hotWallet.address], currency, [indexOfHotWallet.toString()], path, connection);
  }
}

export async function findWalletBalance(coin: string, connection: Connection) {
  let walletBalance = await connection.getRepository(WalletBalance).findOne({
    where: {
      userId: userId,
      coin: coin,
      walletId: walletId,
    }
  })
  return walletBalance;
}

export async function insertWithdrawalRecord(toAddress: string, amount: number, coin: string, connection: Connection){
  let withdrawal = new Withdrawal();
  withdrawal.userId = userId;
  withdrawal.walletId = walletId;
  withdrawal.txid = `TMP_WITHDRAWAL_TX` + toAddress + Date.now().toString();
  withdrawal.currency = coin,
  // sub_currency: subcoin,
  withdrawal.fromAddress = 'TMP_ADDRESS';
  withdrawal.toAddress = toAddress;
  withdrawal.amount = amount.toString();
  withdrawal.status = UNSIGNED,
  withdrawal.hashCheck = 'TMP_HASHCHECK';
  withdrawal.kmsDataKeyId = kmsId;  
  await connection.getRepository(Withdrawal).save(withdrawal);
  return withdrawal.id;
}

export async function insertBalance(withdrawalId: number, currency: string, amount: number, connection: Connection) {
  let walletBalance = await connection.getRepository(WalletBalance).findOne({
    where: {
      walletId: walletId,
      currency: currency
    }
  })
  walletBalance.withdrawalPending = (new BigNumber(walletBalance.withdrawalPending).plus(amount)).toString();
  walletBalance.balance = (new BigNumber(walletBalance.balance).minus(amount)).toString();
  let walletLog = new WalletLog();
  walletLog.walletId = walletId;
  walletLog.balanceChange = (-amount).toString();
  walletLog.refId = withdrawalId;
  walletLog.currency = currency;
  walletLog.event = 'withdraw_request';
  connection.getRepository(WalletLog).save(walletLog);
  connection.getRepository(WalletBalance).save(walletBalance);
}

export async function findIdDB(id: number, connection: Connection) {
  let withdrawal = await connection.getRepository(Withdrawal).findOne({
    where: {
      id: id,
      status: 'signing'
    }
  })
  if (!withdrawal) {
    return null;
  }
  return withdrawal.withdrawalTxId;
}
