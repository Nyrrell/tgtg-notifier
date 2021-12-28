import { readFileSync, existsSync } from 'fs';

const config = existsSync('./config.json') ? JSON.parse(readFileSync('./config.json')) : JSON.parse(process.env.CONFIG_JSON);

const TIMEZONE = config['Timezone'];
const LOCALE = config['Locale'];
const USERS = config['Users'];

export {
  TIMEZONE,
  LOCALE,
  USERS
}