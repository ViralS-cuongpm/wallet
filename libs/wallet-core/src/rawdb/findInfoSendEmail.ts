import { EnvConfig } from '../entities';
import { EntityManager, In } from 'typeorm';

export async function findInfoSendEmail(manager: EntityManager): Promise<string> {
  return (await manager.findOne(EnvConfig, {
      where: {
        key: 'MAILER_RECEIVER',
      },
    })).value;
}
