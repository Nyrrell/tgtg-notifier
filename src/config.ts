import { readFile } from 'node:fs/promises';

const configFile = await readFile('./config.json', 'utf8').catch(({ message })=> console.error(message));
if (!configFile) process.exit(1);

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