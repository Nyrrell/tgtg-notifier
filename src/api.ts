import { getApkVersion, logger, sleep } from './utils.js';
import { JOB } from './app.js';

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

  private async fetch<T>(endpoint: string, { headers, body }: TGTG_API_PARAMS): Promise<T | Response> {
    if (!this.userAgent) {
      this.userAgent = await this.getUserAgent();
    }
    const controller = new AbortController();
    const { signal } = controller;
    const request = this.request(endpoint, signal, { headers, body });
    logger.req('%o', request);

    const res = await fetch(request);
    logger.res(`[Status Code] ${res.status}`);

    this.cookie = res.headers.get('set-cookie') as string;
    if (res.ok) {
      this.captchaError = 0;
      if (endpoint === ENDPOINT.AUTH_POLLING && res.status === 202) return res;
      // Because sometimes res.json() throw an error
      const json = JSON.parse(await res.text());
      controller.abort();
      logger.res(json);
      return json;
    }

    if (res.status === 403) {
      logger.error('❌ Captcha Error 403');
      this.captchaError += 1;
    } else {
      throw res;
    }

    if (this.captchaError === 1) {
      this.userAgent = await this.getUserAgent();
    }
    if (this.captchaError === 4) {
      this.cookie = '';
    }
    if (this.captchaError >= 10) {
      logger.warn('⚠️ Too many captcha Errors !', '💤 Waiting 10 minutes');
      JOB.pause();
      await sleep(1000 * 60);
      logger.info('♻️ Retrying');
      this.captchaError = 0;
      JOB.resume();
    }
    await sleep(1000);
    return this.fetch(endpoint, { headers, body });
  }

  private request(endpoint: string, signal: AbortSignal, { headers, body }: TGTG_API_PARAMS): Request {
    return new Request(this.BASE_URL + endpoint, {
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
      signal,
    });
  }

  async loginByEmail(email: string): Promise<TGTG_API_LOGIN | Response> {
    return this.fetch(ENDPOINT.AUTH_BY_EMAIL, {
      body: {
        device_type: 'ANDROID',
        email: email,
      },
    });
  }

  authPolling(email: string, pollingId: string) {
    return this.fetch(ENDPOINT.AUTH_POLLING, {
      body: {
        device_type: 'ANDROID',
        email: email,
        request_polling_id: pollingId,
      },
    });
  }

  async refreshToken(accessToken: string, refreshToken: string): Promise<TGTG_API_REFRESH | Response> {
    return await this.fetch(ENDPOINT.REFRESH_TOKEN, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      body: {
        refresh_token: refreshToken,
      },
    });
  }

  getItems(
    accessToken: string,
    userId: string,
    withStock: boolean = true,
    favorite: boolean = true
  ): Promise<TGTG_STORES | Response> {
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
        user_id: userId,
      },
    });
  }
}

enum ENDPOINT {
  AUTH_POLLING = 'auth/v3/authByRequestPollingId',
  REFRESH_TOKEN = 'auth/v3/token/refresh',
  AUTH_BY_EMAIL = 'auth/v3/authByEmail',
  ITEM = 'item/v8/',
}

export default new TGTG_API();
