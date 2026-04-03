// Based on https://github.com/Der-Henning/tgtg

import got from 'got';

import { getApkVersion } from '../common/utils.ts';
import { logger } from '../common/logger.ts';

const DATADOME_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DATADOME_DK = '1D42C2CA6131C526E09F294FE96F94';

const datadomeCache = {
  value: null as string | null,
  expiresAt: 0,
};

const generateDatadomeCid = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~_';
  return Array.from({ length: 120 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const fetchDatadomeCookie = async (requestUrl: string, userAgent: string): Promise<string | null> => {
  try {
    const cid = generateDatadomeCid();
    const params = new URLSearchParams({
      camera: '{"auth":"true", "info":"{\\"front\\":\\"2000x1500\\",\\"back\\":\\"5472x3648\\"}"}',
      cid,
      ddk: DATADOME_DK,
      ddv: '3.0.4',
      ddvc: await getApkVersion(),
      events: `[{"id":1,"message":"response validation","source":"sdk","date":${Date.now()}}]`,
      inte: 'android-java-okhttp',
      mdl: 'Pixel 7 Pro',
      os: 'Android',
      osn: 'UPSIDE_DOWN_CAKE',
      osr: '14',
      osv: '34',
      request: requestUrl,
      screen_d: '3.5',
      screen_x: '1440',
      screen_y: '3120',
      ua: userAgent,
    });

    const res = await got.post('https://api-sdk.datadome.co/sdk/', {
      http2: true,
      throwHttpErrors: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        'User-Agent': userAgent,
        'Accept-Encoding': 'gzip, deflate, br',
      },
      body: params.toString(),
    });

    const data = JSON.parse(res.body);
    if (data.status === 200 && data.cookie) {
      const match = data.cookie.match(/datadome=([^;]+)/);
      if (match) return match[1];
    }
  } catch (e) {
    logger.debug(`DataDome fetch failed: ${e}`);
  }
  return null;
};

export const ensureDatadomeCookie = async (requestUrl: string, userAgent: string): Promise<string | undefined> => {
  if (datadomeCache.value && Date.now() < datadomeCache.expiresAt) {
    return datadomeCache.value;
  }

  logger.debug('Retrieving DataDome cookie');
  const value = await fetchDatadomeCookie(requestUrl, userAgent);
  if (value) {
    datadomeCache.value = value;
    datadomeCache.expiresAt = Date.now() + DATADOME_CACHE_DURATION;
    logger.debug('DataDome cookie obtained.');
    return value;
  }
  logger.warn('Failed to obtain DataDome cookie, continuing without it.');
  return undefined;
};

export const invalidateDatadome = (): void => {
  datadomeCache.value = null;
  datadomeCache.expiresAt = 0;
};
