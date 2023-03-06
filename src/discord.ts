import axios from "axios";

import { LOCALE, PRICE, STOCK, TIMEZONE } from "./config.js";

export default class discord {
  webhook = axios.create();
  webhookURL;

  constructor(webhookURL: string) {
    this.webhookURL = webhookURL;
    this.webhook.interceptors.request.use((config) => {
      config.data["username"] = "Too Good To Go";
      config.data["avatar_url"] =
        "https://cdn.jsdelivr.net/gh/Nyrrell/tgtg-notifier@master/icon.png";
      return config;
    });
  }

  sendNewItemsAvailable = (store: any): Promise<void> =>
    this.webhook.post(this.webhookURL, {
      embeds: [this.newItemEmbedded(store)],
    });

  sendMessage = (message: string): Promise<void> =>
    this.webhook.post(this.webhookURL, {
      embeds: [
        {
          color: parseInt("2980b9", 16),
          title: message,
        },
      ],
    });

  private newItemEmbedded = (store: any): Object => {
    const { minor_units, code } = store["item"]["price_including_taxes"];
    const price = (minor_units / 100).toLocaleString(LOCALE, {
      style: "currency",
      currency: code,
    });

    const { start, end } = store["pickup_interval"];
    const pickupStart = new Date(start);
    const pickupEnd = new Date(end);

    const dateDiff = Math.round(
      (pickupStart.getTime() - Date.now()) / 1000 / 60 / 60 / 24
    );

    const dateTime = new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      timeStyle: "short",
    }).formatRange(pickupStart, pickupEnd);

    const relativeTime = new Intl.RelativeTimeFormat(LOCALE, {
      numeric: "auto",
    })
      .format(dateDiff, "day")
      .replace(/^\w/, (c) => c.toUpperCase());

    return {
      color: parseInt("27ae60", 16),
      title: store["display_name"],
      footer: { text: `📥 ${relativeTime} ${dateTime}` },
      fields: [
        {
          name: STOCK,
          value: store["items_available"].toString(),
          inline: true,
        },
        { name: PRICE, value: price, inline: true },
      ],
    };
  };
}
