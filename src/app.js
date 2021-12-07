import cron from 'node-cron';
import { KeyvFile } from 'keyv-file';
import { readFileSync } from 'fs';
import Keyv from '@keyvhq/core';

import * as discord from './discord.js';
import * as api from './api.js';

const db = new Keyv({ store: new KeyvFile({ filename: './db.json' }) });
const { users, timezone } = JSON.parse(readFileSync('./config.json'));

class TGTGClient {
  email;
  userID;
  accessToken;
  refreshToken;

  constructor({ "Email": email, "User-ID": userID, "Access-Token": accessToken, "Refresh-Token": refreshToken }) {
    this.email = email;
    this.userID = userID;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  alreadyLogged = () => this.userID && this.accessToken && this.refreshToken;

  get credentials() {
    return {
      "Email": this.email,
      "User-ID": this.userID,
      "Access-Token": this.accessToken,
      "Refresh-Token": this.refreshToken
    };
  };

  login = async () => this.alreadyLogged() ? await this.refreshAccessToken() : await this.loginByEmail();

  refreshAccessToken = async () => {
    try {
      const { data } = await api.refreshToken(this.accessToken, this.refreshToken);
      this.accessToken = data['access_token'];
      this.refreshToken = data['refresh_token'];
    } catch (e) {
      console.error(e);
    }
  }

  loginByEmail = async () => {
    try {
      const { data } = await api.loginByEmail(this.email);
      return this.startPolling(data['polling_id']);
    } catch (e) {
      console.error(e);
    }
  };

  startPolling = async (pollingId) => {
    try {
      const { data, status } = await api.authPolling(this.email, pollingId);
      if (status === 202) {
        console.log("⚠️ Check your email to continue, 1 minute to go !");
        await this.wait(60000);
        return this.startPolling(pollingId);
      } else if (status === 200) {
        console.log("✅ Successfully Logged");
        this.accessToken = data['access_token'];
        this.refreshToken = data['refresh_token'];
        this.userID = data['startup_data']['user']['user_id'];
        return console.log(this.credentials);
      } else {
        console.log("❌ Connection failed, check your settings or validate your connection within the allotted time.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  getItems = async () => {
    try {
      const { data } = await api.getItems(this.accessToken, this.userID);
      for (const store of data['items']) {
        await this.compareStock(store);
        await db.set(store['item']['item_id'], store['items_available']);
      }
    } catch (e) {
      if (e.response?.status === 401) return this.refreshAccessToken();
    }
  }

  compareStock = async (store) => {
    const stock = await db.get(store['item']['item_id']);
    if (store['items_available'] > stock)
      return discord.sendNotif(store);
  }

  monitor = cron.schedule('* * * * *', async () => {
      await this.getItems();
    }, { scheduled: false, timezone: timezone }
  );

}

const main = async () => {
  for (const user of users) {
    const client = new TGTGClient(user);
    await client.login();
    await client.monitor.start();
  }
};

await main();