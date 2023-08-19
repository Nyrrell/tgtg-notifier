import { debuglog } from 'node:util';

import { LOCALE } from './config.js';

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const getApkVersion = async (): Promise<string> => {
  const defaultApkVersion = '23.6.11';
  let apkVersion = '';

  const apk = await fetch('https://play.google.com/store/apps/details?id=com.app.tgtg&hl=en&gl=US').then((res) =>
    res.text()
  );
  const regExp = /AF_initDataCallback\({key:\s*'ds:5'.*? data:([\s\S]*?), sideChannel:.+<\/script/gm;

  const match = regExp.exec(apk);

  if (match) {
    const data = JSON.parse(match[1]);
    apkVersion = data[1][2][140][0][0][0];
  }

  return apkVersion ? apkVersion : defaultApkVersion;
};

const timestamp = () => `[${new Date().toLocaleString(LOCALE)}]`.replaceAll('/', '-');
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
