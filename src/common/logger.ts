import { debuglog } from 'node:util';

import { LOCALE, TIMEZONE } from '../config.js';

const timestamp = () => `[${new Date().toLocaleString(LOCALE, { timeZone: TIMEZONE })}]`.replaceAll('/', '-');
const debug = debuglog('dev');
const debugReq = debuglog('req');
const debugRes = debuglog('res');
export const logger = {
  info: (...args: any) => console.info(timestamp(), '\x1b[34mINFO\x1b[0m:', ...args),
  error: (...args: any) => console.error(timestamp(), '\x1b[31mERROR\x1b[0m:', ...args),
  warn: (...args: any) => console.warn(timestamp(), '\x1b[33mWARN\x1b[0m:', ...args),
  debug: (...args: any) => debug(timestamp(), ...args),
  req: (...args: any) => debugReq(timestamp(), ...args),
  res: (...args: any) => debugRes(timestamp(), ...args),
};
