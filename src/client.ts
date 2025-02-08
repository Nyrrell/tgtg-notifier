import { errors } from 'undici';

import { NotificationType, NotifierService, NotifierType } from './notifiers/notifierService.js';
import { Discord, Gotify, Ntfy, Signal, Telegram } from './notifiers/index.js';
import { SEND_START_NOTIFICATION } from './config.js';
import { sleep, TEST_ITEM } from './common/utils.js';
import { logger } from './common/logger.js';
import database from './database.js';
import api from './api.js';
import {
  NotifierConfig,
  TelegramConfig,
  DiscordConfig,
  GotifyConfig,
  SignalConfig,
  NtfyConfig,
} from './notifiers/config/index.js';

export class Client {
  private readonly email: string;
  private accessToken: string;
  private refreshToken: string;
  private readonly notifiers: Array<NotifierService>;
  private readonly maxPollingTries: Array<number> = new Array(24);

  constructor(user: ACCOUNT) {
    this.email = user['email'];
    this.accessToken = user['accessToken'];
    this.refreshToken = user['refreshToken'];
    this.notifiers = this.setNotifiers(user['notifiers'] as Array<NotifierConfig>);
  }

  private setNotifiers(notifierConfigs: Array<NotifierConfig>) {
    return notifierConfigs.map((notifier): NotifierService => {
      switch (notifier.type) {
        case NotifierType.DISCORD:
          return new Discord(notifier as DiscordConfig);
        case NotifierType.GOTIFY:
          return new Gotify(notifier as GotifyConfig);
        case NotifierType.SIGNAL:
          return new Signal(notifier as SignalConfig);
        case NotifierType.TELEGRAM:
          return new Telegram(notifier as TelegramConfig);
        case NotifierType.NTFY:
          return new Ntfy(notifier as NtfyConfig);
        default:
          throw new Error(`Unexpected notifier config: ${notifier.type}`);
      }
    });
  }

  get credentials() {
    return {
      email: this.email,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }

  private accountIsFilled = (): Boolean => Boolean(this.email || this.alreadyLogged());

  private alreadyLogged = (): Boolean => Boolean(this.accessToken && this.refreshToken);

  private refreshAccessToken = async (): Promise<Boolean> => {
    logger.debug(`[Refresh Token] ${this.email}`);
    try {
      const { access_token, refresh_token } = (await api.refreshToken(
        this.accessToken,
        this.refreshToken
      )) as TGTG_API_REFRESH;

      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      return true;
    } catch (error) {
      logger.error(`[Refresh Token] ${this.email}`);
      logger.error(error);
      return false;
    }
  };

  private loginByEmail = async (): Promise<void | Boolean> => {
    logger.debug(`[Login By Mail] ${this.email}`);
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
      logger.error(`[Login By Email] ${this.email}`);
      if (error instanceof errors.ResponseStatusCodeError) {
        if (error.status === 429) {
          logger.error('Too many requests. Try again later');
        }
      }
      logger.error(error);
      return false;
    }
  };

  private startPolling = async (pollingId: string): Promise<Boolean> => {
    logger.debug(`[Login start polling] ${this.email}`);
    try {
      for (const attempt of this.maxPollingTries.keys()) {
        const { access_token, refresh_token, statusCode } = (await api.authPolling(
          this.email,
          pollingId
        )) as TGTG_API_POLLING;
        if (statusCode === 202) {
          if (attempt === 0)
            logger.warn("Check your email to continue, don't use your mobile if TGTG App is installed !");
          await sleep(5000);
        }
        if (access_token && refresh_token) {
          logger.info(`Successfully Logged`);
          this.accessToken = access_token;
          this.refreshToken = refresh_token;
          logger.info('Printing account credentials');
          logger.info('%o', this.credentials);
          return true;
        }
      }

      logger.warn('Max polling retries reached. Try again.');
      return false;
    } catch (error) {
      if (error instanceof errors.ResponseStatusCodeError && error.status === 429) {
        logger.warn('Too many requests. Try again later.');
        return false;
      }

      logger.error(error);
      return false;
    }
  };

  private compareStock = async (store: TGTG_ITEM): Promise<void> => {
    const stock = await database.get(this.email, store['item']['item_id']);
    if ((!stock && store['items_available'] > 0) || (store['items_available'] > stock && stock === 0)) {
      logger.debug('New item available (%s) for store %s', store.items_available, store.display_name);
      this.notifiers.forEach((notifier) => notifier.sendNotification(NotificationType.NEW_ITEM, store));
    }
  };

  public getItems = async (withStock = true): Promise<void> => {
    logger.debug(`[Get Items] ${this.email}`);
    try {
      const { items } = (await api.getItems(this.accessToken, withStock)) as TGTG_STORES;

      for (const store of items) {
        await this.compareStock(store);
        await database.set(this.email, store['item']['item_id'], store['items_available']);
      }
    } catch (error) {
      logger.error(`[Get Items] ${this.email}`);
      if (error instanceof errors.ResponseStatusCodeError) {
        if (error.status === 401 && (await this.refreshAccessToken())) {
          return this.getItems();
        }
      }
      logger.error(error);
    }
  };

  public login = async (): Promise<Boolean> => {
    logger.debug(`[Login] ${this.email}`);
    if (!this.accountIsFilled()) {
      logger.error('You must provide at least Email or Access-Token and Refresh-Token');
      return false;
    }
    logger.debug(`Login account`);
    const logged = this.alreadyLogged() ? await this.refreshAccessToken() : await this.loginByEmail();

    if (!logged) return false;

    const message = `Start monitoring account : ${this.email}`;
    logger.info(message);

    if (SEND_START_NOTIFICATION) {
      this.notifiers.forEach((notifier) => notifier.sendNotification(NotificationType.START, message));
    }

    return true;
  };

  public testNotifiers = async (): Promise<void> => {
    for (const notifier of this.notifiers) {
      logger.info(`Sending notification to ${notifier.getType()}`);
      await notifier.sendNotification(NotificationType.NEW_ITEM, TEST_ITEM);
    }
  };
}
