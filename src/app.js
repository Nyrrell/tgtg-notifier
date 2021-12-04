import { KeyvFile } from "keyv-file";
import Keyv from "@keyvhq/core";
import cron from 'node-cron';
import "dotenv/config";

import * as discord from './discord.js';
import * as api from './api.js';

const { EMAIL, USER_ID, ACCESS_TOKEN, REFRESH_TOKEN, TIMEZONE } = process.env;

const db = new Keyv({ store: new KeyvFile({ filename: './db.json' }) });


class TGTGClient {
  constructor(email) {
    this.email = email;
    this.userID = USER_ID ? USER_ID : null;
    this.accessToken = ACCESS_TOKEN ? ACCESS_TOKEN : null;
    this.refreshToken = REFRESH_TOKEN ? REFRESH_TOKEN : null;
  }

  wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  alreadyLogged = () => this.userID && this.accessToken && this.refreshToken;

  login = async () => this.alreadyLogged() ? await this.refreshAccessToken() : await this.loginByEmail();

  refreshAccessToken = async () => {
    try {
      const { data } = await api.refreshToken(this.accessToken, this.refreshToken)
      this.accessToken = data['access_token']
      this.refreshToken = data['refresh_token']
    } catch (e) {
      console.error(e)
    }
  }

  loginByEmail = async () => {
    try {
      const { data } = await api.loginByEmail(this.email);
      return this.startPolling(data['polling_id'])
    } catch (e) {
      console.error(e)
    }
  };

  startPolling = async (pollingId) => {
    try {
      const { data, status } = await api.authPolling(this.email, pollingId)
      if (status === 202) {
        console.log("⚠️ Check your email to continue, 1 minute to go !");
        await this.wait(60000);
        return this.startPolling(pollingId);

      } else if (status === 200) {
        console.log("✅ Successfully Logged");
        this.accessToken = data['access_token']
        this.refreshToken = data['refresh_token']
        this.userID = data['startup_data']['user']['user_id'];
      } else {
        console.log("❌ Connection failed, check your settings or validate your connection within the allotted time.");
      }
    } catch (e) {
      console.error(e)
    }
  }

  getItems = async () => {
    try {
      const { data } = await api.getItems(this.accessToken, this.userID);
      for (const store of data['items']) {
        await this.compareStock(store)
        await db.set(store['item']['item_id'], store['items_available'])
      }
    } catch (e) {
      if (e.response?.status === 401) return this.refreshAccessToken()
    }
  }

  compareStock = async (store) => {
    const stock = await db.get(store['item']['item_id']);
    if (store['items_available'] > stock)
      return discord.sendNotif(store);
  }

  monitor = cron.schedule('* * * * *', async () => {
      await this.getItems()
    }, { scheduled: false, timezone: TIMEZONE }
  );

}

const main = async () => {
  const client = new TGTGClient(EMAIL);

  await client.login();
  await client.monitor.start();
};

await main();