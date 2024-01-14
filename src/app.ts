import { exit, env } from 'node:process';
import { Cron } from 'croner';

import { ACCOUNTS, TEST_NOTIFIERS } from './config.js';
import { Client } from './client.js';
import { logger } from './utils.js';

export const JOB: Cron = Cron('* * * * *');

const main = async (): Promise<void> => {
  const clientsToMonitor: Client[] = [];

  for await (const account of ACCOUNTS) {
    logger.debug('[Init]', account.email);
    const initClient: Client = new Client(account);

    if (TEST_NOTIFIERS) {
      logger.info(`Account ${account.email} test notifiers.`);
      await initClient.testNotifiers();
      return exit(0);
    }

    if (await initClient.login()) {
      clientsToMonitor.push(initClient);
    } else {
      logger.warn(`Failed to login account : ${account.email}`);
    }
  }

  if (!clientsToMonitor.length) {
    logger.error('No account to monitor, process exit.');
    return exit(1);
  }

  JOB.schedule(async (): Promise<void> => {
    for (const client of clientsToMonitor) {
      await client.getItems();
    }
  });
};

logger.info('Too Good To Go Monitor is starting in ver.', env['npm_package_version']);
await main();
