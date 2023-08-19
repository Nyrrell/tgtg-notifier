import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

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
