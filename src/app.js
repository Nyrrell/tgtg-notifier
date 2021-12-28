import { KeyvFile } from 'keyv-file';
import Keyv from '@keyvhq/core';
import cron from 'node-cron';

import whatsapp from './whatsapp.js';
import discord from './discord.js';
import api from './api.js';

import { LOCALE, TIMEZONE, USERS } from "./config.js";

class TGTGClient {
  db;
  name;
  email;
  userID;
  notifier;
  favorite;
  accessToken;
  refreshToken;
  maxPollingTries = new Array(24);

  constructor(
    {
      "Name": name,
      "Email": email,
      "User-ID": userID,
      "Access-Token": accessToken,
      "Refresh-Token": refreshToken,
      "Favorite": favorite = true
    }) {
    this.name = name
    this.email = email;
    this.userID = userID;
    this.favorite = favorite;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.db = new Keyv({ store: new KeyvFile({ filename: `./db-${name}.json` }), namespace: name });
  }

  setNotifier = async (notifier) => {
    if (notifier['Discord']) {
      this.notifier = await new discord(notifier['Discord']);
    } else if (notifier['WhatsApp']) {
      const { Filename, IdResolvable } = notifier['WhatsApp'];
      this.notifier = await new whatsapp(Filename, IdResolvable);
      await this.notifier.init();
    }
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
        await this.db.set(store['item']['item_id'], store['items_available']);
      }
    } catch ({ message, response }) {
      if (response.status === 401) return this.refreshAccessToken();
      console.error(message);
    }
  };

  compareStock = async (store) => {
    const stock = await this.db.get(store['item']['item_id']);
    if (store['items_available'] > stock)
      return this.serviceNotifier(store);
  };

  serviceNotifier = async (store) => {
    const title = store['display_name'];
    const logo = store['item']['logo_picture']['current_url'];
    const items = store['items_available'].toString();
    const price = (store['item']['price_including_taxes']?.['minor_units'] / 100).toLocaleString(LOCALE,
      {
        style: "currency",
        currency: "EUR"
      });

    const formatter = new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, timeStyle: "short" });
    const pickupStart = formatter.format(new Date(store['pickup_interval']['start']));
    const pickupEnd = formatter.format(new Date(store['pickup_interval']['end']));
    const pickupInterval = `Pickup interval ${pickupStart} to ${pickupEnd}`;

    this.notifier.sendNotif({ title, items, price, pickupInterval })
  }

  monitor = cron.schedule('* * * * *', async () => {
      await this.getItems();
    }, { scheduled: false, timezone: TIMEZONE }
  );

  startMonitoring = () => {
    console.log(`Start monitoring ${this.name}`);
    //this.notifier.sendMonitoring(this.name);
    this.monitor.start();
  };

}

const main = async () => {
  for (const user of USERS) {
    const client = new TGTGClient(user);
    if (!await client.login()) return;
    await client.setNotifier(user['Notifier']);
    await client.startMonitoring();
  }
};

await main();