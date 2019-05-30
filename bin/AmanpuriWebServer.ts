import * as Utils from './typeorm_migration/src/service/Utils';
import util from 'util';
import { getLogger } from 'sota-common/src/Logger';
import { CurrencyRegistry } from 'sota-common';
import * as bodyParser from 'body-parser';
import { BtcWebServer } from 'sota-btc';
import { createConnection, getConnection, Connection } from 'wallet-core/node_modules/typeorm';
import {callbacks} from 'wallet-core';
import { indexOfHotWallet } from './typeorm_migration/src/service/Const';

const logger = getLogger('BaseWebServer');
export class AmanpuriWebServer extends BtcWebServer {

  protected setup() {
    super.setup();
    this.app.use(bodyParser.json());
    //api create addresses
    this.app.post('/api/:currency/address', async (req, res) => {
      try {
        await this.createNewAddress(req, res);
      } catch (e) {
        logger.error(`createNewAddress err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });  
    //api insert db to pick
    this.app.post('/api/:currency/withdrawal/approve', async (req, res) => {
      try {
        await this.approveTransaction(req, res);
      } catch (e) {
        logger.error(`createNewAddress err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });      
    //api sign transaction
    this.app.post('/api/:currency/withdrawal/accept', async (req, res) => {
      try {
        await this.signTransaction(req, res);
      } catch (e) {
        logger.error(`createNewAddress err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });      
       
  }  

    /**
   * createAddress
   */
  
  public async createNewAddress(req: any, res: any) {
    const connection = getConnection();
    const network: string = await  this.getNetwork(connection);
    const pass: string = req.body.pass;
    const amount: number = req.body.amount;
    const nameCoin: string = req.params.currency.toString();
    //check params
    if (!nameCoin) {
      res.status(400).json({ error: "Lack currency"})
      return;
    }    
    let currency:string = this.getCurrency(nameCoin)
    let coin: string = this.getCoin(nameCoin)
    if (!currency) {
      res.status(400).json({ error: "Incorrect currency"})
    }
    if (!coin) {
      res.status(400).json({ error: "Incorrect coin"})
    }    
    const index: number = req.body.index;
    const masterprivatekey: string = req.body.masterprivatekey;

    if (!network) {
      res.status(400).json({ error: "Lack network"})
      return;
    }
    if (!pass) {
      res.status(400).json({ error: "Lack pass"})
      return;
    }
    if (!amount) {
      res.status(400).json({ error: "Lack amount"})
      return;
    }
    if (index === null || typeof index === 'undefined') {
      res.status(400).json({ error: "Lack index"})
      return;
    }
    if (!masterprivatekey) {
      res.status(400).json({ error: "Lack masterprivatekey"})
      return;
    }
  
    try {
      if (!await Utils.checkPrivateKey(currency, connection)) {
        await Utils.initWallet(pass, masterprivatekey, coin, currency, network, connection);
      }
      if (!await Utils.checkPassword(pass, currency, connection)) {
        res.status(400).json({ error: "Invalid Password"});
        return ;
      }      
      if (!await Utils.validatePrivateKey(currency, pass, masterprivatekey, connection)) {
        res.status(400).json({ error: "Invalid MasterPrivateKey"});
        return ;
      }      
      const address = await Utils.createAddress(pass, coin, index, amount, network, masterprivatekey, connection, currency);
      if (!address) {
        res.status(400).json({ error: "Dont have hd-wallet"});
        return;
      }
      res.json(address);
    }  catch (e) {
      res.status(500).json( {error: e.toString()});
      return;
    }

  }
  
  protected async validateToAddress(address: string) {
    if (await this.getGateway(this._currency.symbol).isValidAddressAsync(address)) {
      return true;
    }
    return false;
  } 

  protected async signTransaction(req: any, res: any) {
    const id: number = req.body.withdrawal_id;
    const pass: string = req.body.pass;
    const nameCoin: string = req.params.currency.toString();
    if (!nameCoin) {
      res.status(400).json({ error: "Lack currency"})
      return;
    }    
    let currency:string = this.getCurrency(nameCoin)
    let coin: string = this.getCoin(nameCoin)
    if (!currency) {
      res.status(400).json({ error: "Incorrect currency"})
    }
    if (!coin) {
      res.status(400).json({ error: "Incorrect coin"})
    } 
    if (!id) {
      res.status(400).json({ error: "Lack withdrawalId"})
      return;
    }
    if (!pass) {
      res.status(400).json({ error: "Lack pass"})
      return;
    }
    const connection = getConnection();
    const network: string = await this.getNetwork(connection);
    if (!await Utils.checkPassword(pass, currency, connection)) {
      res.status(400).json({ error: "Invalid Password"});
      return ;
    }  
    let privateKey = pass;
    let currencyRegistry = CurrencyRegistry.EOS;
    if (currency === 'btc') {
      currencyRegistry = CurrencyRegistry.Bitcoin;
      privateKey = await Utils.calPrivateKey(pass, indexOfHotWallet, currency, network, connection)
    }
    const withdrawalTxId = await Utils.findId(id, connection);  
    if (!withdrawalTxId) {
      res.status(400).json({ error: "Unknow transactionTxId"});
    }    
    try {
      await callbacks.signerDoProcess(currencyRegistry, privateKey, withdrawalTxId);
      const tx_hash = await Utils.findTxHash(withdrawalTxId, connection);
    } catch (e) {
      res.status(500).json({ error: "error"})
      return;
    }
    res.json({id: withdrawalTxId});
    // const privateKey = Utils.calPrivateKey()
    //TODO
  } 

  public async approveTransaction(req: any, res: any) {
    const toAddress: string = req.body.toAddress;
    const amount: number = req.body.amount;
    const nameCoin: string = req.params.currency.toString();
    if (!nameCoin) {
      res.status(400).json({ error: "Lack currency"})
      return;
    }    
    let currency:string = this.getCurrency(nameCoin)
    let coin: string = this.getCoin(nameCoin)
    if (!toAddress) {
      res.status(400).json({ error: "Lack toAddress"})
      return;
    }
    if (!amount) {
      res.status(400).json({ error: "Lack amount"})
      return;
    }    
    if (!currency) {
      res.status(400).json({ error: "Incorrect currency"})
      return;
    }
    if (!coin) {
      res.status(400).json({ error: "Incorrect currency"})
      return;
    }     
    if (!await this.validateToAddress(toAddress)) {
      res.status(400).json({ error: "Invalid address"})
      return;
    }
    const connection = getConnection();
    const network: string = await this.getNetwork(connection);
    try {
      const response = await Utils.approveTransaction(toAddress, amount, coin, currency, connection);
      if (response) {
        return res.json({id: response});
      }
      res.json('dont have wallet');
    } catch (e) {
      res.status(400).json({ error: e.toString()});
    }
  }

  //get plaform
  getCurrency(coin:string) {
    if (coin === 'usdt') {
      return 'btc';
    }
    if (coin === 'eos') {
      return 'eos'
    }
    return null;
  }

  //handle get network enviroment
  getNetwork(connection: Connection) {
    return Utils.getNetwork(connection);//TODO
  }

  //get name of usdt in blockchain network
  getCoin(coin:string) {
    if (coin === 'usdt') {
      return 'omni.2';
    }
    if (coin === 'eos') {
      return 'eos'
    }    
    return null;
  }  

}
