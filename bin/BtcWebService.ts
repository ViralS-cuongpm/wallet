import { BtcWebServer } from 'sota-btc';
import { prepareEnvironment } from 'wallet-core';
import { AmanpuriBtcWebServer } from './AmanpuriBtcWebServer';

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
