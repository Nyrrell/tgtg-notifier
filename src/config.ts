import { readFile } from 'node:fs/promises';
import { debuglog } from 'node:util';
import { exit } from 'node:process';

export const debug = debuglog('dev');
export const debugReq = debuglog('req');
export const debugRes = debuglog('res');

debug('Reading config.json file.');
const configFile = await readFile('./config.json', 'utf8').catch(({ message }) => console.error(message));

if (!configFile) {
  console.log('No config file provide, process exit.');
  exit(1);
}

const config = JSON.parse(configFile);

export const STOCK: string = config['Available'] || 'Available';
export const PRICE: string = config['Price'] || 'Price';
export const TIMEZONE: string = config['Timezone'] || 'UTC';
export const LOCALE: string = config['Locale'] || 'en-US';
export const USERS: User[] = config['Users'];
