import got from 'got';

import { ensureDatadomeCookie, invalidateDatadome } from './datadome.ts';

import { getApkVersion, sleep } from '../common/utils.ts';
import { ApiError } from '../common/errors.ts';
import { logger } from '../common/logger.ts';
import { JOB } from '../common/job.ts';

class TGTG_API {
  private readonly BASE_URL: string = 'https://apptoogoodtogo.com/api/';
  private readonly LIST_USER_AGENT: string[] = [
    'TGTG/{apk} Dalvik/2.1.0 (Linux; U; Android 9; Nexus 5 Build/M4B30Z)',
    'TGTG/{apk} Dalvik/2.1.0 (Linux; U; Android 10; SM-G935F Build/NRD90M)',
    'TGTG/{apk} Dalvik/2.1.0 (Linux; Android 12; SM-G920V Build/MMB29K)',
  ];
  private captchaError: number = 0;
  private userAgent: string = '';
  private cookie: string = '';
  private xCorrelationId: string = crypto.randomUUID();
  private MAX_RETRIES = 10;

  private async getUserAgent(): Promise<string> {
    const apk = await getApkVersion();
    return this.LIST_USER_AGENT[Math.floor(Math.random() * this.LIST_USER_AGENT.length)].replace('{apk}', apk);
  }

  private async fetch<T>(endpoint: string, { headers, body }: TGTG_API_PARAMS, retryCount = 0): Promise<T> {
    if (!this.userAgent) {
      this.userAgent = await this.getUserAgent();
    }

    const url = this.BASE_URL + endpoint;

    const datadome = await ensureDatadomeCookie(url, this.userAgent);

    let res: { statusCode: number; body: string; headers: Record<string, string | string[]> };

    try {
      res = await got.post(this.BASE_URL + endpoint, {
        http2: true,
        decompress: true,
        throwHttpErrors: false,
        headers: {
          ...headers,
          'content-type': 'application/json; charset=utf-8',
          'user-agent': this.userAgent,
          accept: 'application/json',
          'accept-language': 'en-GB',
          'accept-encoding': 'gzip',
          'x-os-type': 'ANDROID',
          'x-app-type': 'CONSUMER',
          Cookie: [datadome ? `datadome=${datadome}` : '', this.cookie || ''].filter(Boolean).join('; '),
          ...(this.xCorrelationId && { 'x-correlation-id': this.xCorrelationId }),
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new ApiError(0, String(error));
    }

    logger.debug(`[Status Code] ${res.statusCode}`);

    const newCookie = res.headers['set-cookie'];
    if (newCookie) {
      const sessionCookie = (Array.isArray(newCookie) ? newCookie[0] : newCookie).split(';')[0];
      if (sessionCookie) this.cookie = sessionCookie;
    }

    if (res.headers['x-correlation-id']) {
      this.xCorrelationId = res.headers['x-correlation-id'] as string;
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      this.captchaError = 0;
      return JSON.parse(res.body) as T;
    }

    if (res.statusCode === 403) {
      this.captchaError++;
      logger.error(`Error 403 [${this.captchaError}] retry ${retryCount}/${this.MAX_RETRIES}`);

      if (retryCount >= this.MAX_RETRIES) throw new ApiError(res.statusCode, res.body);

      invalidateDatadome();

      if (retryCount === 0) this.userAgent = await this.getUserAgent();
      else if (retryCount === 4) {
        this.cookie = '';
        logger.warn('Reset cookie session');
      } else if (retryCount === 9) {
        logger.warn('Pause 10 minutes');
        JOB.pause();
        await sleep(1000 * 60 * 10);
        this.captchaError = 0;
        JOB.resume();
      }

      await sleep(Math.min(10000 * (retryCount + 1), 60000));
      return this.fetch(endpoint, { headers, body }, retryCount + 1);
    }

    throw new ApiError(res.statusCode, res.body);
  }

  async loginByEmail(email: string): Promise<TGTG_API_LOGIN> {
    return this.fetch(ENDPOINT.AUTH_BY_EMAIL, {
      body: {
        device_type: 'ANDROID',
        email: email,
      },
    });
  }

  authByRequestPin(email: string, pollingId: string, pin: string): Promise<TGTG_API_AUTH> {
    return this.fetch(ENDPOINT.AUTH_BY_REQUEST_PIN, {
      body: {
        device_type: 'ANDROID',
        email: email,
        request_polling_id: pollingId,
        request_pin: pin,
      },
    });
  }

  refreshToken(accessToken: string, refreshToken: string): Promise<TGTG_API_REFRESH> {
    return this.fetch(ENDPOINT.REFRESH_TOKEN, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      body: {
        refresh_token: refreshToken,
      },
    });
  }

  getItems(accessToken: string, withStock: boolean = true, favorite: boolean = true): Promise<TGTG_STORES> {
    return this.fetch(ENDPOINT.ITEM, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      body: {
        favorites_only: favorite,
        with_stock_only: withStock,
        origin: {
          latitude: 0.0,
          longitude: 0.0,
        },
        radius: 20,
      },
    });
  }
}

enum ENDPOINT {
  AUTH_BY_REQUEST_PIN = 'auth/v5/authByRequestPin',
  REFRESH_TOKEN = 'token/v1/refresh',
  AUTH_BY_EMAIL = 'auth/v5/authByEmail',
  ITEM = 'item/v8/',
}

export default new TGTG_API();
