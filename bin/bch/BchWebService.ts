import { BchWebServer } from 'sota-bch';
import util from 'util';
import { getLogger } from 'sota-common';
import * as bodyParser from 'body-parser';
import { prepareEnvironment, hd } from 'wallet-core';
import { getConnection } from 'wallet-core/node_modules/typeorm';

const logger = getLogger('BchWebService');

prepareEnvironment()
  .then(start)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

function start(): void {
  const worker = new AmanpuriBchWebServer();
  worker.start();
}

class AmanpuriBchWebServer extends BchWebServer {
  /**
   * createAddress
   */

  public async createNewAddress(req: any, res: any) {
    const amount = req.body.amount || 1;
    const coin: string = req.params.currency.toString();
    if (!coin) {
      res.status(400).json({ error: 'Lack currency' });
      return;
    }
    const currency: string = this.getCurrency(coin);
    if (!currency) {
      res.status(400).json({ error: 'Incorrect currency' });
      return;
    }
    if (!coin) {
      res.status(400).json({ error: 'Incorrect coin' });
      return;
    }
    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Lack amount' });
      return;
    }

    try {
      await getConnection().transaction(async manager => {
        const addresses = await hd.createAddresses(currency, coin, amount, manager);
        if (!addresses.length) {
          res.status(400).json({ error: 'Dont have hd-wallet' });
          return;
        }
        res.json(addresses);
      });
      // find currency wallet, if it don't exist, create new currency wallet
    } catch (e) {
      res.status(500).json({ error: e.toString() });
      return;
    }
  }

  public async approveTransaction(req: any, res: any) {
    const toAddress: string = req.body.toAddress;
    const amount: number = req.body.amount;
    const coin: string = req.params.currency.toString();
    if (!coin) {
      res.status(400).json({ error: 'Lack currency' });
      return;
    }
    const currency: string = this.getCurrency(coin);
    if (!toAddress) {
      res.status(400).json({ error: 'Lack toAddress' });
      return;
    }
    if (!amount) {
      res.status(400).json({ error: 'Lack amount' });
      return;
    }
    if (!currency) {
      res.status(400).json({ error: 'Incorrect currency' });
      return;
    }
    if (!coin) {
      res.status(400).json({ error: 'Incorrect currency' });
      return;
    }
    if (!(await this.validateToAddress(toAddress))) {
      res.status(400).json({ error: 'Invalid address' });
      return;
    }
    try {
      await getConnection().transaction(async manager => {
        const response = await hd.approveTransaction(toAddress, amount, coin, currency, manager);
        if (response) {
          return res.json({ id: response });
        }
        res.json('dont have wallet');
      });
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  }

  // get plaform
  public getCurrency(coin: string) {
    if (coin === 'usdt' || coin === 'btc') {
      return 'btc';
    }
    if (coin === 'eos') {
      return 'eos';
    }
    if (coin === 'bch') {
      return 'bch';
    }
    if (coin === 'ltc') {
      return 'ltc';
    }
    if (coin === 'ada') {
      return 'ada';
    }
    if (coin === 'eth') {
      return 'eth';
    }
    if (coin === 'xrp') {
      return 'xrp';
    }
    return null;
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

  protected async validateToAddress(address: string) {
    if (await this.getGateway(this._currency.symbol).isValidAddressAsync(address)) {
      return true;
    }
    return false;
  }
  // get name of usdt in blockchain network
}
