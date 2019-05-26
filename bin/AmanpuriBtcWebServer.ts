import * as Utils from './typeorm_migration/src/service/Utils';
import util from 'util';
import { getLogger } from 'sota-common/src/Logger';
import * as bodyParser from 'body-parser';
import { BtcWebServer } from 'sota-btc';
import { doSign } from './BtcSignerWorker';
import { createConnection, getConnection, Connection } from 'wallet-core/node_modules/typeorm';

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
      res.status(400).json({ error: "Incorrect currency"})
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
        await Utils.initWallet(pass, masterprivatekey, currency, network, connection);
      }
      if (!await Utils.checkPassword(pass, currency, connection)) {
        res.status(400).json({ error: "Invalid Password"});
        return ;
      }      
      if (!await Utils.validatePrivateKey(currency, pass, masterprivatekey, connection)) {
        res.status(400).json({ error: "Invalid MasterPrivateKey"});
        return ;
      }      
      const address = await Utils.createAddress(pass, currency, index, amount, network, masterprivatekey, connection);
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
      res.status(400).json({ error: "Incorrect currency"})
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
    if (!await Utils.checkPassword(pass, currency, connection)) {
      res.status(400).json({ error: "Invalid Password"});
      return ;
    }  
    const privateKey = await Utils.calPrivateKey(pass, 0, currency, network, connection)
    try {
      doSign(privateKey, id);
    } catch (e) {

    }
    res.json('TODO');
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
      if (!response) {
        return res.json(response);
      }
      res.json('dont have wallet');
    } catch (e) {
      res.status(400).json({ error: e.toString()});
    }
  }

  getCurrency(coin:string) {
    if (coin === 'usdt') {
      return 'btc';
    }
    return null;
  }

  getNetwork() {
    return 'testnet';//TODO
  }

  getCoin(coin:string) {
    if (coin === 'usdt') {
      return 'omni.2';
    }
    return null;
  }  

  protected setup() {
    super.setup();
    this.app.use(bodyParser.json());
    this.app.post('/api/:currency/address', async (req, res) => {
      try {
        await this.createNewAddress(req, res);
      } catch (e) {
        logger.error(`createNewAddress err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });  
    
    this.app.post('/api/:currency/withdrawal', async (req, res) => {
      try {
        await this.signTransaction(req, res);
      } catch (e) {
        logger.error(`createNewAddress err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });        
    this.app.post('/api/:currency/withdrawal/accept', async (req, res) => {
      try {
        await this.signTransaction(req, res);
      } catch (e) {
        logger.error(`createNewAddress err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });      
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
