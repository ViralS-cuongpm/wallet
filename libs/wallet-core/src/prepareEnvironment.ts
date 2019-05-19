import { createConnection, getConnection } from 'typeorm';
import { getLogger, BlockchainPlatform, CurrencyRegistry, EnvConfigRegistry } from 'sota-common';
import { CurrencyConfig, EnvConfig } from './entities';
import _ from 'lodash';
import { OmniToken } from './entities/OmniToken';

const logger = getLogger('prepareEnvironment');

export async function prepareEnvironment(): Promise<void> {
  logger.info(`Application has been started.`);
  logger.info(`Preparing DB connection...`);
  await createConnection({
    name: 'default',
    type: 'mysql',
    host: process.env.TYPEORM_HOST,
    port: process.env.TYPEORM_PORT ? parseInt(process.env.TYPEORM_PORT, 10) : 3306,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    synchronize: false,
    logging: process.env.TYPEORM_LOGGING ? process.env.TYPEORM_LOGGING === 'true' : true,
    cache: process.env.TYPEORM_CACHE ? process.env.TYPEORM_CACHE === 'true' : true,
    entities: process.env.TYPEORM_ENTITIES.split(','),
    entityPrefix: process.env.TYPEORM_PREFIX,
  });

  logger.info(`DB connected successfully...`);
  const connection = getConnection();
  logger.info(`Loading environment configurations from database...`);

  const [currencyConfigs, envConfigs, omniTokens] = await Promise.all([
    connection.getRepository(CurrencyConfig).find({}),
    connection.getRepository(EnvConfig).find({}),
    connection.getRepository(OmniToken).find({}),
  ]);

  omniTokens.forEach(token => {
    CurrencyRegistry.registerOmniAsset(token.propertyId, token.symbol, token.name, token.scale);
  });

  currencyConfigs.forEach(config => {
    if (!CurrencyRegistry.hasOneCurrency(config.currency)) {
      return;
    }

    const currency = CurrencyRegistry.getOneCurrency(config.currency);
    CurrencyRegistry.setCurrencyConfig(currency, config);
  });

  envConfigs.forEach(config => {
    EnvConfigRegistry.setCustomEnvConfig(config.key, config.value);
  });

  logger.info(`Environment has been setup successfully...`);
  return;
}
