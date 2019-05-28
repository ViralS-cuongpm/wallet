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
export class AmanpuriBtcWebServer extends BtcWebServer {
  /**
   * createAddress
   */
  
  public async createNewAddress(req: any, res: any) {
    const connection = getConnection();
    const network: string = this.getNetwork();
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
      if (!await Utils.checkPrivateKey(coin, connection)) {
        await Utils.initWallet(pass, masterprivatekey, coin, currency, network, connection);
      }
      if (!await Utils.checkPassword(pass, coin, connection)) {
        res.status(400).json({ error: "Invalid Password"});
        return ;
      }      
      if (!await Utils.validatePrivateKey(coin, pass, masterprivatekey, connection)) {
        res.status(400).json({ error: "Invalid MasterPrivateKey"});
        return ;
      }      
      const address = await Utils.createAddress(pass, coin, index, amount, network, masterprivatekey, connection);
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
    const network: string = this.getNetwork();
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
    if (!await Utils.checkPassword(pass, coin, connection)) {
      res.status(400).json({ error: "Invalid Password"});
      return ;
    }  
    const privateKey = await Utils.calPrivateKey(pass, indexOfHotWallet, coin, network, connection)
    const withdrawalTxId = await Utils.findId(id, connection);
    try {
      await callbacks.signerDoProcess(CurrencyRegistry.Bitcoin, privateKey, withdrawalTxId);
    } catch (e) {
      res.status(500).json({ error: "error"})
      return;
    }
    res.json({id: withdrawalTxId});
    // const privateKey = Utils.calPrivateKey()
    //TODO
  } 

  public async approveTransaction(req: any, res: any) {
    const network: string = this.getNetwork();
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
    return null;
  }

  //handle get network enviroment
  getNetwork() {
    return 'testnet';//TODO
  }

  //get name of usdt in blockchain network
  getCoin(coin:string) {
    if (coin === 'usdt') {
      return 'omni.2';
    }
    return null;
  }  

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
    //api sign transaction
    this.app.post('/api/:currency/withdrawal/accept', async (req, res) => {
      try {
        await this.signTransaction(req, res);
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
  }  
}
