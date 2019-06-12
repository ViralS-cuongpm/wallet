import { BtcWebServer } from 'sota-btc';
import util from 'util';
import { getLogger } from 'sota-common';
import * as bodyParser from 'body-parser';
import { prepareEnvironment, hd } from 'wallet-core';
import { getConnection } from 'wallet-core/node_modules/typeorm';

const logger = getLogger('BtcWebService');

prepareEnvironment()
  .then(start)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

function start(): void {
  const worker = new AmanpuriBtcWebServer();
  worker.start();
}

class AmanpuriBtcWebServer extends BtcWebServer {
  /**
   * createAddress
   */
  public async createNewAddress(req: any, res: any) {
    const amount = req.body.amount || 1;
    let coin: string = req.params.currency.toString();
    if (coin !== 'usdt' && coin !== 'btc') {
      return res.status(400).json({ error: 'Incorrect currency!' });
    }    
    let currency = coin;
    if (coin === 'usdt') {
      coin = 'omni.2';
      currency = 'btc';
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Incorrect amount!' });
    }
    try {
      await getConnection().transaction(async manager => {
        const addresses = await hd.createAddresses(currency, coin, amount, manager);
        if (!addresses.length) {
          return res.status(400).json({ error: 'Do not have HD wallet for this currency' });
        }
        res.json(addresses);
      });
    } catch (e) {
      return res.status(500).json({ error: e.toString() });
    }
  }

  public async approveTransaction(req: any, res: any) {
    const toAddress: string = req.body.toAddress;
    const amount: number = req.body.amount;
    let coin: string = req.params.currency.toString();
    // if (coin !== 'usdt' && coin !== 'btc') {
    //   res.status(400).json({ error: 'Incorrect currency!' });
    //   return;
    // }    
    let currency = coin;
    if (coin === 'usdt') {
      coin = 'omni.2';
      currency = 'btc';
    }
    if (!amount) {
      return res.status(400).json({ error: 'Incorrect amount!' });
    }
    if (!(await hd.validateAddress(currency, toAddress))) {
      return res.status(400).json({ error: 'Invalid address!' });
    }
    try {
      await getConnection().transaction(async manager => {
        const response = await hd.approveTransaction(toAddress, amount, coin, currency, manager);
        if (!response) {
          res.status(500).json({ error: 'Fail!' });
        }
        return res.json({ id: response });
      });
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  }

  public async settingThreshold(req: any, res: any) {
    const listInfo = req.body.listInfo;  
    const mailerReceive = req.body.mailerReceive;  
    if (!listInfo.length) {
      return res.status(400).json({ error: 'Dont have data' });
    }
    await getConnection().transaction(async manager => {
      await hd.saveThreshold(listInfo, mailerReceive, manager);      
    });
    return res.json('ok');    
  }

  public async getSettingThreshold(req: any, res: any) {
    let list;
    await getConnection().transaction(async manager => {
      list = await hd.getSettingThreshold(manager);      
    });
    return res.json(list);    
  }

  protected setup() {
    super.setup();
    this.app.use(bodyParser.json());
    // api create addresses
    this.app.post('/api/:currency/address', async (req, res) => {
      try {
        await this.createNewAddress(req, res);
      } catch (e) {
        logger.error(`createNewAddress err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });
    // api insert db to pick
    this.app.post('/api/:currency/withdrawal/approve', async (req, res) => {
      try {
        await this.approveTransaction(req, res);
      } catch (e) {
        logger.error(`approve err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });
    this.app.post('/api/setting_threshold', async (req, res) => {
      try {
        await this.settingThreshold(req, res);
      } catch (e) {
        logger.error(`approve err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });    
    this.app.get('/api/setting_threshold', async (req, res) => {
      try {
        await this.getSettingThreshold(req, res);
      } catch (e) {
        logger.error(`approve err=${util.inspect(e)}`);
        res.status(500).json({ error: e.message || e.toString() });
      }
    });       
  }
}
