import { readFileSync, existsSync } from 'fs';

const config = existsSync('./config.json') ? JSON.parse(readFileSync('./config.json')) : JSON.parse(process.env.CONFIG_JSON);

const STOCK = config['Available'] || 'Available';
const PRICE = config['Price'] || 'Price';
const COOKIE = config['Cookie'] || null;
const TIMEZONE = config['Timezone'];
const LOCALE = config['Locale'];
const USERS = config['Users'];

export {
  TIMEZONE,
  LOCALE,
  COOKIE,
  PRICE,
  STOCK,
  USERS
};