import axios from 'axios';

import { PRICE, STOCK } from "../config.js";

export default class discord {
  webhook = axios.create();
  webhookURL;

  constructor(webhookURL) {
    this.webhookURL = webhookURL;
    this.webhook.interceptors.request.use((config) => {
      config.data['username'] = 'Too Good To Go';
      config.data['avatar_url'] = 'https://toogoodtogo.com/favicon.png';
      return config
    })
  };

  sendNotif = (store) => this.webhook.post(this.webhookURL, {
    embeds: [
      {
        color: parseInt("27ae60", 16),
        title: store['title'],
        footer: { text: store['pickupInterval'] },
        fields: [
          { name: STOCK, value: store['items'], inline: true },
          { name: PRICE, value: store['price'], inline: true }
        ]
      }
    ]
  });

  sendMonitoring = (user = null) => this.webhook.post(this.webhookURL, {
    embeds: [
      {
        color: parseInt("27ae60", 16),
        title: `Start monitoring ${user}`,
      }
    ]
  });
};