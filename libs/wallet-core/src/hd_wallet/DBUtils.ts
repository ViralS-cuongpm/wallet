import { EntityManager, In, LessThan, Not } from 'typeorm';
import { Wallet, Address, HotWallet, WalletBalance, WithdrawalTx, EnvConfig, Withdrawal, WalletLog } from '../entities';
import { userId, UNSIGNED, kmsId, indexOfHotWallet} from './Const';
import { BigNumber, CurrencyRegistry } from 'sota-common';

const passwordHash = require('password-hash');

export async function findOrCreateWallet(currency: string, connection: EntityManager): Promise<Wallet> {
  const wallet: Wallet = await connection.getRepository(Wallet).findOne({
    where: {
      currency: currency
    }
  })
  if (!wallet) {
    wallet.isHd = true;
    wallet.secret = 'haha';
    if (currency === 'eos' || currency === 'xrp') {
      wallet.isHd = false;
      wallet.secret = 'default';
    }
    wallet.currency = currency;
    wallet.userId = userId;
    wallet.label = currency.toUpperCase() + ' wallet';
    wallet.id = await findWalletId(currency);    
  }
  await connection.getRepository(Wallet).save(wallet);
  return wallet;
}

// export async function checkPrivateKeyDB (currency: string, connection: EntityManager) {
//   let masterPrivateKey = await connection.getRepository(MasterPrivateKey).findOne({
//     where: {
//       currency: currency,      
//     }
//   }) 
//   if (!masterPrivateKey) {
//     return false;
//   }   
//   return true;
// }

// export async function checkPasswordDB (currency: string, pass: string, connection: EntityManager) {
//   let masterPrivateKey = await connection.getRepository(MasterPrivateKey).findOne({
//     where: {
//       currency: currency
//     }
//   }) 
//   if (!passwordHash.verify(pass, masterPrivateKey.passwordHash)) {
//     return false;
//   }   
//   return true;
// }  

export async function saveAddresses(walletId: number, addresses: string[], currency: string, privateKeys: string[], path: string,connection: EntityManager) {
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

// export async function getPrivateKey(currency: string, connection: EntityManager) {
//   let masterPrivateKey = await connection.getRepository(MasterPrivateKey).findOne({
//     where: {
//       currency: currency,
//     }
//   })  
//   if(masterPrivateKey) {
//     return {
//       walletId: masterPrivateKey.walletId,
//       seed: masterPrivateKey.encrypted
//     }
//   }
//   return null;
// }

// export async function saveMasterPrivateKey(encrypted: string, currency: string, password: string, connection: EntityManager) {
//   const masterPrivateKeyRepo = connection.getRepository(MasterPrivateKey);
//   let masterPrivateKey = await masterPrivateKeyRepo.findOne({
//     where: {
//       currency: currency,
//     }
//   })
//   if(!masterPrivateKey) {
//     masterPrivateKey = new MasterPrivateKey();
//     masterPrivateKey.walletId = usdtWalletId;
//     masterPrivateKey.encrypted = encrypted;
//     masterPrivateKey.passwordHash = passwordHash.generate(password);
//     masterPrivateKey.currency = currency;
//     await masterPrivateKeyRepo.save(masterPrivateKey);
//   }
// }

export async function createWallet(currency: string, connection: EntityManager) {
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

export async function saveHotWallet(path: string, address: string, currency: string, walletId: number, connection: EntityManager) {
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
    hotWallet.secret = indexOfHotWallet.toString();
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
    saveAddresses(walletId, [hotWallet.address], currency, [indexOfHotWallet.toString()], path, connection);
  }
}

export async function findWalletBalance(walletId: number, coin: string, connection: EntityManager) {
  let walletBalance = await connection.getRepository(WalletBalance).findOne({
    where: {
      userId: userId,
      coin: coin,
      walletId: walletId,
    }
  })
  return walletBalance;
}

export async function insertWithdrawalRecord(walletId: number, toAddress: string, amount: number, coin: string, connection: EntityManager){
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

export async function insertBalance(walletId: number, withdrawalId: number, currency: string, amount: number, connection: EntityManager) {
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

export async function findIdDB(id: number, connection: EntityManager) {
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

export async function findTxHashDB(id: number, connection: EntityManager) {
  let withdrawalTx = await connection.getRepository(WithdrawalTx).findOne(id);
  if (!withdrawalTx) {
    return null;
  }
  return withdrawalTx.txid;
}

export async function getNetworkDB(connection: EntityManager) {
  let env = await connection.getRepository(EnvConfig).findOne({
    where: {
      key: 'network'
    }
  });
  if (!env) {
    return null;
  }
  return env.value;  
}

export async function findWalletId(currency: string) {
  switch (currency) {
    case 'btc': {
      return 1001;
    }
    case 'eth': {
      return 1006;
    }
    case 'eos': {
      return 1002;
    }
    case 'ltc': {
      return 1005;
    }
    case 'xrp': {
      return 1004;
    }
    default: { //ada
      return 1003;
    }
  }
}

export async function countAddresses(currency: string, connection: EntityManager) {
  return await connection.getRepository(Address).count({
    currency: currency
  })
}

export async function getSeeder(currency: string, connection: EntityManager) {
  return (await connection.getRepository(Wallet).findOne({
    where: {
      currency: currency
    }
  })).secret;
}

export async function findSecretHotWallet(address: string, currency: string, connection: EntityManager) {
  const hotWallet = await connection.getRepository(HotWallet).findOne({
    where: {
      currency: currency,
      address: address
    }
  })
  return hotWallet.secret;
}

export async function findSecretWallet(currency: string, connection: EntityManager) {
  const wallet = await connection.getRepository(Wallet).findOne({
    where: {
      currency: currency
    }
  })
  return wallet.secret;
}