import { LtcWebServer } from 'sota-ltc';
import util from 'util';
import { getLogger } from 'sota-common';
import * as bodyParser from 'body-parser';
import { prepareEnvironment, hd } from 'wallet-core';
import { getConnection } from 'wallet-core/node_modules/typeorm';

const logger = getLogger('LtcWebService');

prepareEnvironment()
  .then(start)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

function start(): void {
  const worker = new AmanpuriLtcWebServer();
  worker.start();
}

class AmanpuriLtcWebServer extends LtcWebServer {
  /**
   * createAddress
   */

  public async createNewAddress(req: any, res: any) {
    const amount = req.body.amount || 1;
    const coin: string = req.params.currency.toString();
    if (coin !== 'ltc') {
      return res.status(400).json({ error: 'Incorrect currency!' });      
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Incorrect amount!' });
    }
    const currency = coin;
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
    const coin: string = req.params.currency.toString();
    if (coin !== 'ltc') {
      return res.status(400).json({ error: 'Incorrect currency!' });
    }
    if (!amount) {
      return res.status(400).json({ error: 'Incorrect amount!' });
    }
    const currency = coin;
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
  }
}
