import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

import * as CONSTANT from './common/constants.js';

const configFile = await readFile('./config.json', 'utf8').catch(({ message }) => console.error(message));

if (!configFile) {
  console.error('No config file provide, process exit.');
  exit(1);
}

const config = JSON.parse(configFile);

export const STOCK: string = config?.['language']?.['available'] || CONSTANT.DEFAULT_AVAILABLE;
export const PRICE: string = config?.['language']?.['price'] || CONSTANT.DEFAULT_PRICE;
export const TIMEZONE: string = config['timezone'] || CONSTANT.DEFAULT_TIMEZONE;
export const LOCALE: string = config['locale'] || CONSTANT.DEFAULT_LOCALE;
export const LOG_LEVEL: string = config['logLevel'] || CONSTANT.DEFAULT_LOG_LEVEL;
export const ACCOUNTS: ACCOUNT[] = config['accounts'];
export const TEST_NOTIFIERS: boolean = config?.['testNotifiers'];
export const SEND_START_NOTIFICATION: string = config?.['sendStartNotification'] ?? true;
export const CRON_SCHEDULE: string = config?.['cronSchedule'] || CONSTANT.DEFAULT_CRON_SCHEDULE;
