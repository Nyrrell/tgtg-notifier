import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

import * as CONSTANT from './common/constants.ts';
import { getEnv } from './common/utils.ts';

const configFile = await readFile('./config.json', 'utf8').catch(({ message }) => console.error(message));

if (!configFile) {
  console.error('No config file provide, process exit.');
  exit(1);
}

const config = JSON.parse(configFile);

export const ACCOUNTS: ACCOUNT[] = config.accounts;
export const STOCK: string = getEnv('TGTG_STOCK', config?.language?.available, CONSTANT.DEFAULT_AVAILABLE);
export const PRICE: string = getEnv('TGTG_PRICE', config?.language?.price, CONSTANT.DEFAULT_PRICE);
export const TIMEZONE: string = getEnv('TGTG_TIMEZONE', config.timezone, CONSTANT.DEFAULT_TIMEZONE);
export const LOCALE: string = getEnv('TGTG_LOCALE', config.locale, CONSTANT.DEFAULT_LOCALE);
export const LOG_LEVEL: string = getEnv('TGTG_LOG_LEVEL', config.logLevel, CONSTANT.DEFAULT_LOG_LEVEL);
export const TEST_NOTIFIERS: boolean = Boolean(getEnv('TGTG_TEST_NOTIFIERS', config.testNotifiers, false));
export const SEND_START_NOTIFICATION: boolean = Boolean(
  getEnv('TGTG_SEND_START_NOTIFICATION', config.sendStartNotification, true)
);
export const CRON_SCHEDULE: string = getEnv('TGTG_CRON_SCHEDULE', config.cronSchedule, CONSTANT.DEFAULT_CRON_SCHEDULE);
export const PORT: number = parseInt(getEnv('TGTG_PORT', config.port, CONSTANT.DEFAULT_PORT), 10);
export const HOST: number = getEnv('TGTG_HOST', config.host, CONSTANT.DEFAULT_HOST);
