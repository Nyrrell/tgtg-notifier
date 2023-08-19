import { exit, env } from 'node:process';
import { Cron } from 'croner';

import { Client } from './client.js';
import { USERS } from './config.js';
import { logger } from './utils.js';

const main = async (): Promise<void> => {
  const clientsToMonitor: Client[] = [];

  for await (const user of USERS) {
    logger.debug(`[Init] ${user.Name}`);
    const initClient: Client = new Client(user);
    if (await initClient.login()) clientsToMonitor.push(initClient);
  }

  if (!clientsToMonitor.length) {
    logger.error('No account to monitor, process exit.');
    return exit(1);
  }

  Cron('* * * * *', async (): Promise<void> => {
    for (const client of clientsToMonitor) {
      await client.getItems();
    }
  });
};

logger.info('Too Good To Go Monitor is starting in ver.', env['npm_package_version']);
await main();
