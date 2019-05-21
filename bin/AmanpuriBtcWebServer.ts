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
    const network = 'testnet';
    const pass: string = req.body.pass.toString();
    const amount: number = req.body.amount;
    const currency: string = req.params.currency.toString();
    const index: number = req.body.index;
    if (!userId) {
      res.status(400).json({ error: "Lack user_id"})
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
    if (!index) {
      res.status(400).json({ error: "Lack index"})
      return;
    }
    try {
      const address = await Utils.createAddress(pass, currency, index, amount, network, userId);
      if(!address) {
        res.status(400).json({ error: "Dont have hd-wallet"});
        return;
      }
      res.json(address);
    }  catch (e) {
      res.status(500).json( {error: e.toString()});
    }

  }

  protected async initWallet(req: any, res: any) {
    const pass: string = req.body.pass;
    const masterprivatekey: string = req.body.masterprivatekey;
    const currency: string = req.params.currency;
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
    await Utils.initWallet(pass, masterprivatekey, currency, userId);    
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
