import { exit, env } from 'node:process';
import { Cron } from 'croner';

import { ACCOUNTS, CRON_SCHEDULE, TEST_NOTIFIERS } from './config.js';
import { logger } from './common/logger.js';
import { Client } from './client.js';

export const JOB: Cron = Cron(CRON_SCHEDULE, { protect: true });

const main = async (): Promise<void> => {
  const clientsToMonitor: Client[] = [];

  for await (const account of ACCOUNTS) {
    logger.info(`Initialize account : ${account.email}`);
    const initClient: Client = new Client(account);

    if (TEST_NOTIFIERS) {
      logger.info('Testing each notifiers...');
      await initClient.testNotifiers();
      continue;
    }

    if (await initClient.login()) {
      clientsToMonitor.push(initClient);
    } else {
      logger.warn(`Failed to login account : ${account.email}`);
    }
  }

  if (TEST_NOTIFIERS) {
    logger.info('Notification test complete.');
    return exit(0);
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

logger.info(`Too Good To Go Monitor is starting in ver. ${env['npm_package_version']}`);
await main().catch((reason) => logger.error(reason));
