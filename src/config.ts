import { readFileSync } from 'fs';

const configFile = readFileSync('./config.json', 'utf8');
const config = JSON.parse(configFile);

const STOCK: string = config['Available'] || 'Available';
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