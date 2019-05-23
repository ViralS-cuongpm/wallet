import * as Utils from './typeorm_migration/src/service/Utils';
import util from 'util';
import { getLogger } from 'sota-common/src/Logger';
import * as bodyParser from 'body-parser';
import { BtcWebServer } from 'sota-btc';

const logger = getLogger('BaseWebServer');
const userId = 1;
export class AmanpuriBtcWebServer extends BtcWebServer {
  /**
   * createAddress
   */
  
  public async createNewAddress(req: any, res: any) {
    const network: string = req.body.network;
    const pass: string = req.body.pass.toString();
    const amount: number = req.body.amount;
    const currency: string = req.params.currency.toString();
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
    if (!currency) {
      res.status(400).json({ error: "Lack currency"})
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
      if (!await Utils.checkPrivateKey(currency)) {
        await Utils.initWallet(pass, masterprivatekey, currency, userId, network);
      }
      if (!await Utils.checkPassword(pass, currency)) {
        res.status(400).json({ error: "Invalid Password"});
        return ;
      }      
      if (!await Utils.validatePrivateKey(currency, pass, masterprivatekey)) {
        res.status(400).json({ error: "Invalid MasterPrivateKey"});
        return ;
      }      
      const address = await Utils.createAddress(pass, currency, index, amount, network, userId, masterprivatekey);
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

  protected async initWallet(req: any, res: any) {
    const network: string = req.body.network;
    const pass: string = req.body.pass;
    const masterprivatekey: string = req.body.masterprivatekey;
    const currency: string = req.params.currency;
    if (!network) {
      res.status(400).json({ error: "Lack network"})
      return;
    }
    if (!userId) {
      res.status(400).json({ error: "Lack user_id"})
      return;
    }
    if (!masterprivatekey) {
      res.status(400).json({ error: "Lack masterprivatekey"})
      return;
    }
    if (!pass) {
      res.status(400).json({ error: "Lack pass"})
      return;
    }
    if (!currency) {
      res.status(400).json({ error: "Lack currency"})
      return;
    }
    await Utils.initWallet(pass, masterprivatekey, currency, userId, network);
  } 

  protected async signTransaction(req: any, res: any) {
    const network = 'testnet';
    const id: number = req.body.withdrawal_id;
    const pass: string = req.body.pass;
    const currency: string = req.params.currency.toString();
    if (!id) {
      res.status(400).json({ error: "Lack withdrawalId"})
      return;
    }
    if (!pass) {
      res.status(400).json({ error: "Lack pass"})
      return;
    }
    await Utils.calPrivateKey(pass, 0, currency, userId, network)
    res.json('TODO');
    // const privateKey = Utils.calPrivateKey()
    //TODO
  } 
  protected setup() {
    super.setup();
    this.app.use(bodyParser.json());
    this.app.get('/api/:currency/haha', async (req, res) => {
      res.json('ok');
    });
    this.app.post('/api/:currency/address', async (req, res) => {
      try {
        await this.createNewAddress(req, res);
      } catch (e) {
        logger.error(`createNewAddress err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });

    this.app.post('/api/:currency/init-wallet', async (req, res) => {
      try {
        await this.initWallet(req, res);
        res.json('ok');
      } catch (e) {
        logger.error(`init-wallet err=${util.inspect(e)}`);
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
  }  
}
