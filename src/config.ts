import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

const configFile = await readFile('./config.json', 'utf8').catch(({ message }) => console.error(message));

if (!configFile) {
  console.error('No config file provide, process exit.');
  exit(1);
}

const config = JSON.parse(configFile);

export const STOCK: string = config?.['language']?.['available'] || 'Available';
export const PRICE: string = config?.['language']?.['price'] || 'Price';
export const TIMEZONE: string = config['timezone'] || 'UTC';
export const LOCALE: string = config['locale'] || 'en-US';
export const LOG_LEVEL: string = config['logLevel'] || 'info';
export const ACCOUNTS: ACCOUNT[] = config['accounts'];
export const TEST_NOTIFIERS: boolean = config?.['testNotifiers'];
export const SEND_START_NOTIFICATION: string = config?.['sendStartNotification'] ?? true;
