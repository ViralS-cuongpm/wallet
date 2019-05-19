import { ICrawlerOptions, BlockchainPlatform } from 'sota-common';
import { prepareEnvironment, callbacks } from 'wallet-core';
import { BtcCrawler } from 'sota-btc';

prepareEnvironment()
  .then(start)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

function start(): void {
  const { getLatestCrawledBlockNumber, onCrawlingTxs, onBlockCrawled } = callbacks;
  const crawlerOpts: ICrawlerOptions = {
    getLatestCrawledBlockNumber,
    onCrawlingTxs,
    onBlockCrawled,
  };

  const crawler = new BtcCrawler(BlockchainPlatform.Bitcoin, crawlerOpts);
  crawler.start();
}
