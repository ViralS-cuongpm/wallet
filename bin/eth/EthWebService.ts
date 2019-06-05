import { EthWebServer } from 'sota-eth';
import util from 'util';
import { getLogger } from 'sota-common';
import * as bodyParser from 'body-parser';
import { prepareEnvironment, hd } from 'wallet-core';
import { getConnection } from 'wallet-core/node_modules/typeorm';

const logger = getLogger('EthWebService');

prepareEnvironment()
  .then(start)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

function start(): void {
  const worker = new AmanpuriEthWebServer();
  worker.start();
}

class AmanpuriEthWebServer extends EthWebServer {
  /**
   * createAddress
   */

  public async createNewAddress(req: any, res: any) {
    const amount = req.body.amount || 1;
    let coin: string = req.params.currency.toString();
    if (!coin) {
      res.status(400).json({ error: 'Lack currency' });
      return;
    }
    const currency: string = this.getCurrency(coin);
    if (coin === 'usdt') {
      coin = 'omni.2';
    }
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
        switch (currency) {
          case 'ada': {
            throw new Error('TODO');
          }
          case 'eos':
          case 'xrp': {
            throw new Error('Cannot create new address ' + currency);
          }
          default: {
            const addresses = await hd.createAddresses(currency, coin, amount, manager);
            if (!addresses.length) {
              res.status(400).json({ error: 'Dont have hd-wallet' });
              return;
            }
            res.json(addresses);
          }
        }
      });
      // find currency wallet, if it don't exist, create new currency wallet
    } catch (e) {
      res.status(500).json({ error: e.toString() });
      return;
    }
  }

  // protected async signTransaction(req: any, res: any) {
  //   const id: number = req.body.withdrawal_id;
  //   const pass: string = req.body.pass;
  //   const nameCoin: string = req.params.currency.toString();
  //   if (!nameCoin) {
  //     res.status(400).json({ error: "Lack currency"})
  //     return;
  //   }
  //   let currency:string = this.getCurrency(nameCoin)
  //   let coin: string = this.getCoin(nameCoin)
  //   if (!currency) {
  //     res.status(400).json({ error: "Incorrect currency"})
  //   }
  //   if (!coin) {
  //     res.status(400).json({ error: "Incorrect coin"})
  //   }
  //   if (!id) {
  //     res.status(400).json({ error: "Lack withdrawalId"})
  //     return;
  //   }
  //   if (!pass) {
  //     res.status(400).json({ error: "Lack pass"})
  //     return;
  //   }
  //   const connection = getConnection();
  //   const network: string = await this.getNetwork(connection);
  //   if (!await Utils.checkPassword(pass, currency, connection)) {
  //     res.status(400).json({ error: "Invalid Password"});
  //     return ;
  //   }
  //   let privateKey = pass;
  //   let currencyRegistry = CurrencyRegistry.EOS;
  //   if (currency === 'btc') {
  //     currencyRegistry = CurrencyRegistry.Bitcoin;
  //     privateKey = await Utils.calPrivateKey(pass, indexOfHotWallet, currency, network, connection)
  //   }
  //   const withdrawalTxId = await Utils.findId(id, connection);
  //   if (!withdrawalTxId) {
  //     res.status(400).json({ error: "Unknow transactionTxId"});
  //   }
  //   try {
  //     await callbacks.signerDoProcess(currencyRegistry, privateKey, withdrawalTxId);
  //     const tx_hash = await Utils.findTxHash(withdrawalTxId, connection);
  //   } catch (e) {
  //     res.status(500).json({ error: "error"})
  //     return;
  //   }
  //   res.json({id: withdrawalTxId});
  //   // const privateKey = Utils.calPrivateKey()
  //   //TODO
  // }

  public async approveTransaction(req: any, res: any) {
    const toAddress: string = req.body.toAddress;
    const amount: number = req.body.amount;
    let coin: string = req.params.currency.toString();
    if (!coin) {
      res.status(400).json({ error: 'Lack currency' });
      return;
    }
    const currency: string = this.getCurrency(coin);
    if (coin === 'usdt') {
      coin = 'omni.2';
    }
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
    // api sign transaction
    // this.app.post('/api/:currency/withdrawal/accept', async (req, res) => {
    //   try {
    //     await this.signTransaction(req, res);
    //   } catch (e) {
    //     logger.error(`createNewAddress err=${util.inspect(e)}`);
    //     res.status(500).json({ error: e.message || e.toString() });
    //   }
    // });
  }

  protected async validateToAddress(address: string) {
    if (await this.getGateway(this._currency.symbol).isValidAddressAsync(address)) {
      return true;
    }
    return false;
  }
  // get name of usdt in blockchain network
}
