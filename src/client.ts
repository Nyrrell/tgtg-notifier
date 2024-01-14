import { NotificationType, NotifierService, NotifierType } from './notifiers/notifierService.js';
import { DiscordConfig, GotifyConfig, SignalConfig } from './notifiers/config/index.js';
import { Discord, Gotify, Signal } from './notifiers/index.js';
import { logger, sleep, TEST_ITEM } from './utils.js';
import { LOCALE, TIMEZONE } from './config.js';
import database from './database.js';
import api from './api.js';

export class Client {
  private readonly email: string;
  private userID: string;
  private accessToken: string;
  private refreshToken: string;
  private readonly notifiers: Array<NotifierService>;
  private readonly maxPollingTries: Array<number> = new Array(24);

  constructor(user: ACCOUNT) {
    this.email = user['email'];
    this.userID = user['userId'];
    this.accessToken = user['accessToken'];
    this.refreshToken = user['refreshToken'];
    this.notifiers = user['notifiers'].map((notifier) => {
      switch (notifier.type) {
        case NotifierType.DISCORD:
          return new Discord(notifier as DiscordConfig);
        case NotifierType.GOTIFY:
          return new Gotify(notifier as GotifyConfig);
        case NotifierType.SIGNAL:
          return new Signal(notifier as SignalConfig);
        default:
          throw new Error(`Unexpected notifier config: ${notifier.type}`);
      }
    });
  }

  get credentials(): object {
    return {
      Email: this.email || 'No email provide',
      'User-ID': this.userID,
      'Access-Token': this.accessToken,
      'Refresh-Token': this.refreshToken,
    };
  }

  private alreadyLogged = (): Boolean => Boolean(this.userID && this.accessToken && this.refreshToken);

  private refreshAccessToken = async (): Promise<Boolean> => {
    logger.debug('[Refresh Token]', this.email);
    try {
      const { access_token, refresh_token } = (await api.refreshToken(
        this.accessToken,
        this.refreshToken
      )) as TGTG_API_REFRESH;

      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      return true;
    } catch (error) {
      if (error as Response) {
        const response = error as Response;
        logger.error('[Refresh Token]', this.email, await response.text());
        return false;
      }
      logger.error('[Refresh Token]', this.email, error);
      return false;
    }
  };

  private loginByEmail = async (): Promise<void | Boolean> => {
    logger.debug('[Login By Mail]', this.email);
    try {
      const { state, polling_id } = (await api.loginByEmail(this.email)) as TGTG_API_LOGIN;

      if (state === 'TERMS') {
        logger.error(
          `TGTG return your email "${this.email}" is not linked to an account, signup with this email first`
        );
        return false;
      }
      if (state === 'WAIT') return this.startPolling(polling_id);
    } catch (error) {
      if (error as Response) {
        const { status } = error as Response;

        if (status === 429) logger.error('❌ Too many requests. Try again later');
        else logger.error('[Login By Email]', this.email, error);
        return false;
      }
      logger.error('[Login By Email]', this.email, error);
      return false;
    }
  };

  private startPolling = async (pollingId: string): Promise<Boolean> => {
    logger.debug('[Login Start Polling]', this.email);
    try {
      for (const attempt of this.maxPollingTries.keys()) {
        const { access_token, refresh_token, startup_data, status } = (await api.authPolling(
          this.email,
          pollingId
        )) as TGTG_API_POLLING;
        if (status === 202) {
          if (attempt === 0)
            logger.warn(
              `⚠️ ${this.email} : Check your email to continue, don't use your mobile if TGTG App is installed !`
            );
          await sleep(5000);
        }
        if (access_token && refresh_token) {
          logger.info(`✅ ${this.email} successfully Logged`);
          this.accessToken = access_token;
          this.refreshToken = refresh_token;
          this.userID = startup_data['user']['user_id'];
          logger.info(this.credentials);
          return true;
        }
      }

      logger.warn('Max polling retries reached. Try again.');
      return false;
    } catch (error) {
      if (error as Response) {
        const { status } = error as Response;
        if (status === 429) {
          logger.warn(`⚠️ ${this.email} : Too many requests. Try again later.`);
        } else {
          logger.error(`❌ ${this.email} : Connection failed, return this :`, error);
        }
      } else {
        logger.error(error);
      }
      return false;
    }
  };

  private compareStock = async (store: TGTG_ITEM): Promise<void> => {
    const stock = await database.get(this.email, store['item']['item_id']);
    if ((!stock && store['items_available'] > 0) || (store['items_available'] > stock && stock === 0))
      this.notifiers.forEach((notifier) =>
        notifier.sendNotification(NotificationType.NEW_ITEM, this.parseStoreItem(store))
      );
  };

  private parseStoreItem = (store: TGTG_ITEM): PARSE_TGTG_ITEM => {
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

  public getItems = async (withStock = true): Promise<void> => {
    logger.debug('[Get Items]', this.email);
    try {
      const { items } = (await api.getItems(this.accessToken, this.userID, withStock)) as TGTG_STORES;

      for (const store of items) {
        await this.compareStock(store);
        await database.set(this.email, store['item']['item_id'], store['items_available']);
      }
    } catch (error) {
      if (error as Response) {
        const { status } = error as Response;
        if (status === 401 && (await this.refreshAccessToken())) {
          return this.getItems();
        }
        logger.error('[Get Items]', this.email, error);
        return;
      }
      logger.error('[Get Items]', this.email, error);
    }
  };

  public login = async (): Promise<Boolean> => {
    logger.debug(`[Login] ${this.email}`);
    if (!this.email && !this.alreadyLogged()) {
      logger.warn('⚠️ You must provide at least Email or User-ID, Access-Token and Refresh-Token');
      return false;
    }
    logger.info(`Start login user : ${this.email}`);
    const logged = this.alreadyLogged() ? await this.refreshAccessToken() : await this.loginByEmail();

    if (!logged) return false;

    const message = `Start monitoring user : ${this.email}`;
    logger.info(message);
    this.notifiers.forEach((notifier) => notifier.sendNotification(NotificationType.START, message));
    return true;
  };

  public testNotifiers = async (): Promise<void> => {
    for (const notifier of this.notifiers) {
      logger.info(`Sending notification test to ${notifier.getType()}`);
      await notifier.sendNotification(NotificationType.NEW_ITEM, TEST_ITEM);
    }
  };
}
