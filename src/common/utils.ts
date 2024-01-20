import { LOCALE, TIMEZONE } from '../config.js';

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

export const TEST_ITEM: PARSE_TGTG_ITEM = {
  id: '0',
  name: 'Item name test notifier',
  available: '10',
  price: '3,99€',
  pickupTime: new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    timeStyle: 'short',
  }).formatRange(new Date(), new Date(Date.now() + 60000 * 10)),
  pickupDate: new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })
    .format(0, 'day')
    .replace(/^\w/, (c) => c.toUpperCase()),
};
