import { readFileSync, existsSync } from 'fs';

const config = existsSync('./config.json') ? JSON.parse(readFileSync('./config.json')) : JSON.parse(process.env.CONFIG_JSON);

const PRICE = config['Price'] || 'Price';
const STOCK = config['Stock'] || 'Stock';
const TIMEZONE = config['Timezone'];
const LOCALE = config['Locale'];
const USERS = config['Users'];

export {
  TIMEZONE,
  LOCALE,
  PRICE,
  STOCK,
  USERS
}