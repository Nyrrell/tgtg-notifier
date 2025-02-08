import { fetch, errors } from 'undici';

import { getApkVersion, sleep } from './common/utils.js';
import { logger } from './common/logger.js';
import { JOB } from './common/job.js';

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

  private async getUserAgent(): Promise<string> {
    const apk = await getApkVersion();
    return this.LIST_USER_AGENT[Math.floor(Math.random() * this.LIST_USER_AGENT.length)].replace('{apk}', apk);
  }

  private async fetch<T>(endpoint: string, { headers, body }: TGTG_API_PARAMS): Promise<T> {
    if (!this.userAgent) {
      this.userAgent = await this.getUserAgent();
    }

    const res = await fetch(this.BASE_URL + endpoint, this.setRequest({ headers, body }));
    logger.debug(`[Status Code] ${res.status}`);

    this.cookie = res.headers.get('set-cookie')?.split(';')[0] as string;
    const data = await res.text();

    if (endpoint === ENDPOINT.AUTH_POLLING && res.status === 202) return { polling: true } as T;

    if (res.status >= 200 && res.status < 300) {
      this.captchaError = 0;
      return JSON.parse(data) as T;
    }

    if (res.status === 403) {
      this.captchaError++;
      logger.error(`Error 403 [${this.captchaError}]`);
    } else {
      throw new errors.ResponseStatusCodeError(data, res.status);
    }

    if (this.captchaError === 1) {
      this.userAgent = await this.getUserAgent();
    }
    if (this.captchaError === 4) {
      this.cookie = '';
    }
    if (this.captchaError >= 10) {
      logger.warn('Too many captcha Errors !');
      logger.info('Sleeping 10 minutes');
      JOB.pause();
      await sleep(1000 * 60 * 10);
      logger.info('Retrying');
      this.captchaError = 0;
      JOB.resume();
    }
    await sleep(10000);
    return this.fetch(endpoint, { headers, body });
  }

  private setRequest({ headers, body }: TGTG_API_PARAMS): {} {
    return {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...headers,
        'content-type': 'application/json; charset=utf-8',
        'user-agent': this.userAgent,
        accept: 'application/json',
        'accept-language': 'en-GB',
        'accept-encoding': 'gzip',
        ...(this.cookie && { Cookie: this.cookie }),
      },
      body: JSON.stringify(body),
    };
  }

  async loginByEmail(email: string): Promise<TGTG_API_LOGIN> {
    return this.fetch(ENDPOINT.AUTH_BY_EMAIL, {
      body: {
        device_type: 'ANDROID',
        email: email,
      },
    });
  }

  authPolling(email: string, pollingId: string): Promise<TGTG_API_POLLING> {
    return this.fetch(ENDPOINT.AUTH_POLLING, {
      body: {
        device_type: 'ANDROID',
        email: email,
        request_polling_id: pollingId,
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
  AUTH_POLLING = 'auth/v5/authByRequestPollingId',
  REFRESH_TOKEN = 'auth/v5/token/refresh',
  AUTH_BY_EMAIL = 'auth/v5/authByEmail',
  ITEM = 'item/v8/',
}

export default new TGTG_API();
