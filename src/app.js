import { KeyvFile } from 'keyv-file';
import { readFileSync } from 'fs';
import Keyv from '@keyvhq/core';
import cron from 'node-cron';

import discord from './discord.js';
import api from './api.js';

const db = new Keyv({ store: new KeyvFile({ filename: './db.json' }) });
const { users, timezone } = JSON.parse(readFileSync('./config.json'));

class TGTGClient {
  name;
  email;
  userID;
  accessToken;
  refreshToken;
  favorite;
  maxPollingTries = new Array(24);

  constructor(
    {
      "Email": email,
      "User-ID": userID,
      "Access-Token": accessToken,
      "Refresh-Token": refreshToken,
      "Name": name,
      "Favorite": favorite = true
    }) {
    this.email = email;
    this.userID = userID;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    this.name = name
    this.favorite = favorite
  }
  
  get credentials() {
    return {
      "Email": this.email || "No email provide",
      "User-ID": this.userID,
      "Access-Token": this.accessToken,
      "Refresh-Token": this.refreshToken
    };
  };
  
  wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  alreadyLogged = () => this.userID && this.accessToken && this.refreshToken;

  login = async () => {
    if (!this.email && !this.alreadyLogged())
      return console.log("You must provide at least Email or User-ID, Access-Token and Refresh-Token");

    return this.alreadyLogged() ? await this.refreshAccessToken() : await this.loginByEmail();
  };

  refreshAccessToken = async () => {
    try {
      const { data } = await api.refreshToken(this.accessToken, this.refreshToken);

      this.accessToken = data['access_token'];
      this.refreshToken = data['refresh_token'];
      return true;

    } catch ({ message }) {
      console.error(message);
      return false;
    }
  };

  loginByEmail = async () => {
    try {
      const { data } = await api.loginByEmail(this.email);

      if (data['state'] === 'TERMS')
        return console.log(`TGTG return your email "${this.email}" is not linked to an account, signup with this email first`);

      if (data['state'] === 'WAIT')
        return this.startPolling(data['polling_id']);

    } catch ({ message, response }) {
      if (response.status === 429) return console.error("Too many requests. Try again later");
      console.error(message);
    }
  };

  startPolling = async (pollingId) => {
    try {
      for (const attempt of this.maxPollingTries.keys()) {
        const { data, status } = await api.authPolling(this.email, pollingId);

        if (status === 202) {
          if (attempt === 0) console.log("⚠️ Check your email to continue, don't use your mobile if TGTG App is installed !");
          await this.wait(5000);

        } else if (status === 200) {
          console.log(`✅ ${this.name} successfully Logged`);
          this.accessToken = data['access_token'];
          this.refreshToken = data['refresh_token'];
          this.userID = data['startup_data']['user']['user_id'];
          console.log(this.credentials);
          return true;
        }
      }

      console.log('Max polling retries reached. Try again.');
      return false;

    } catch ({ message, response }) {
      if (response.status === 429) {
        console.error("Too many requests. Try again later.");
      } else {
        console.error(`Connection failed, return this message "${message}"`);
      }
      return false;
    }
  };

  getItems = async () => {
    try {
      const { data } = await api.getItems(this.accessToken, this.userID);

      for (const store of data['items']) {
        await this.compareStock(store);
        await db.set(store['item']['item_id'], store['items_available']);
      }
    } catch ({ message, response }) {
      if (response.status === 401) return this.refreshAccessToken();
      console.error(message);
    }
  };

  compareStock = async (store) => {
    const stock = await db.get(store['item']['item_id']);
    if (store['items_available'] > stock)
      return discord.sendNotif(store);
  };

  monitor = cron.schedule('* * * * *', async () => {
      await this.getItems();
    }, { scheduled: false, timezone: timezone }
  );

}

const main = async () => {
  for (const user of users) {
    const client = new TGTGClient(user);
    
    if (!await client.login()) return;
    
    console.log(`Start monitoring ${user['Name'] ? `user ${user['Name']}` : ''}"`);
    await client.monitor.start();
    await discord.sendMonitoring(user['Name']);
  }
};

await main();