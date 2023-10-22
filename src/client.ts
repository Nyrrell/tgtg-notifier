import { logger, sleep } from './utils.js';
import database from './database.js';
import discord from './discord.js';
import api from './api.js';

export class Client {
  private readonly name: string;
  private readonly email: string;
  private userID: string;
  private webhook: discord;
  private accessToken: string;
  private refreshToken: string;
  private favorite: boolean = true;
  private readonly maxPollingTries: Array<number> = new Array(24);

  constructor(user: User) {
    this.name = user['Name'];
    this.email = user['Email'];
    this.userID = user['User-ID'];
    this.favorite = user['Favorite'];
    this.accessToken = user['Access-Token'];
    this.refreshToken = user['Refresh-Token'];
    this.webhook = new discord(user['Webhook']);
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
    logger.debug(`[Refresh Token] ${this.name}`);
    try {
      const { access_token, refresh_token } = (await api.refreshToken(
        this.accessToken,
        this.refreshToken
      )) as TGTG_API_REFRESH;

      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      return true;
    } catch (error) {
      logger.error('[Refresh Token]', error);
      return false;
    }
  };

  private loginByEmail = async (): Promise<void | Boolean> => {
    logger.debug(`[Login By Mail] ${this.name}`);
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
        else logger.error('[Login By Email]', error);
        return false;
      }
      logger.error('[Login By Email]', error);
      return false;
    }
  };

  private startPolling = async (pollingId: string): Promise<Boolean> => {
    logger.debug(`[Login Start Polling] ${this.name}`);
    try {
      for (const attempt of this.maxPollingTries.keys()) {
        const { access_token, refresh_token, startup_data, status } = (await api.authPolling(
          this.email,
          pollingId
        )) as TGTG_API_POLLING;
        if (status === 202) {
          if (attempt === 0)
            logger.warn("⚠️ Check your email to continue, don't use your mobile if TGTG App is installed !");
          await sleep(5000);
        }
        if (access_token && refresh_token) {
          logger.info(`✅ ${this.name} successfully Logged`);
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
          logger.warn('⚠️ Too many requests. Try again later.');
        } else {
          logger.error('❌ Connection failed, return this :', error);
        }
      } else {
        logger.error(error);
      }
      return false;
    }
  };

  private compareStock = async (store: TGTG_STORE): Promise<void> => {
    const stock = await database.get(this.name, store['item']['item_id']);
    if ((!stock && store['items_available'] > 0) || (store['items_available'] > stock && stock === 0))
      await this.webhook.sendNewItemsAvailable(store);
  };

  public getItems = async (withStock = true): Promise<void> => {
    logger.debug(`[Get Items] ${this.name}`);
    try {
      const { items } = (await api.getItems(this.accessToken, this.userID, withStock)) as TGTG_STORES;

      for (const store of items) {
        await this.compareStock(store);
        await database.set(this.name, store['item']['item_id'], store['items_available']);
      }
    } catch (error) {
      if (error as Response) {
        const { status } = error as Response;
        if (status === 401 && (await this.refreshAccessToken())) {
          return this.getItems();
        }
        logger.error('[Get Items]', error);
        return;
      }
      logger.error('[Get Items]', error);
    }
  };

  public login = async (): Promise<Boolean> => {
    logger.debug(`[Login] ${this.name}`);
    if (!this.email && !this.alreadyLogged()) {
      logger.warn('⚠️ You must provide at least Email or User-ID, Access-Token and Refresh-Token');
      return false;
    }

    const logged = this.alreadyLogged() ? await this.refreshAccessToken() : await this.loginByEmail();

    if (!logged) return false;

    const message = `✅ Start monitoring user : ${this.name}`;
    logger.info(message);
    await this.webhook.sendMessage(message);
    return true;
  };
}
