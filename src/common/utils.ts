import { DEFAULT_APK_VERSION } from './constants.js';
import { LOCALE, TIMEZONE } from '../config.js';

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const getApkVersion = async (): Promise<string> => {
  const defaultApkVersion = DEFAULT_APK_VERSION;
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

export const parseStoreItem = (store: TGTG_ITEM): SENDABLE_ITEM => {
  const { minor_units, code } = store['item']['item_price'];
  const price = (minor_units / 100).toLocaleString(LOCALE, {
    style: 'currency',
    currency: code,
  });

  const { start, end } = store['pickup_interval'];
  const pickupStart = new Date(start);
  const pickupEnd = new Date(end);

  const dateTime = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    timeStyle: 'short',
  }).formatRange(pickupStart, pickupEnd);

  const dateDiff = Math.round((pickupStart.getTime() - Date.now()) / 1000 / 60 / 60 / 24);
  const relativeTime = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })
    .format(dateDiff, 'day')
    .replace(/^\w/, (c) => c.toUpperCase());

  return {
    id: store['item']['item_id'],
    name: store['display_name'],
    available: store['items_available'].toString(),
    price: price,
    pickupTime: dateTime,
    pickupDate: relativeTime,
  };
};

export const TEST_ITEM: TGTG_ITEM = {
  display_name: 'Item name test notifier',
  items_available: 10,
  item: {
    item_id: '0',
    item_price: {
      code: 'EUR',
      minor_units: 399,
    },
  },
  pickup_interval: {
    start: new Date().toString(),
    end: new Date(Date.now() + 60000 * 10).toString(),
  },
  pickup_location: {
    address: {
      address_line: '',
    },
    location: {
      longitude: 0,
      latitude: 0,
    },
  },
};
