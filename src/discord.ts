import { LOCALE, PRICE, STOCK, TIMEZONE } from './config.js';

export default class discord {
  private readonly webhook;
  private readonly username = 'Too Good To Go';
  private readonly avatar = 'https://cdn.jsdelivr.net/gh/Nyrrell/tgtg-notifier@master/icon.png';

  constructor(webhookURL: string) {
    this.webhook = new Request(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  sendNewItemsAvailable = (store: TGTG_STORE): Promise<Response> =>
    fetch(this.webhook, {
      body: this.jsonBody({
        embeds: [this.newItemEmbedded(store)],
      }),
    });

  sendMessage = (message: string): Promise<Response> =>
    fetch(this.webhook, {
      body: this.jsonBody({
        embeds: [
          {
            color: parseInt('2980b9', 16),
            title: message,
          },
        ],
      }),
    });

  private jsonBody = (body: object): string =>
    JSON.stringify(Object.assign({ username: this.username, avatar_url: this.avatar }, body));

  private newItemEmbedded = (store: TGTG_STORE): Object => {
    const { minor_units, code } = store['item']['price_including_taxes'];
    const price = (minor_units / 100).toLocaleString(LOCALE, {
      style: 'currency',
      currency: code,
    });

    const { start, end } = store['pickup_interval'];
    const pickupStart = new Date(start);
    const pickupEnd = new Date(end);

    const dateDiff = Math.round((pickupStart.getTime() - Date.now()) / 1000 / 60 / 60 / 24);

    const dateTime = new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      timeStyle: 'short',
    }).formatRange(pickupStart, pickupEnd);

    const relativeTime = new Intl.RelativeTimeFormat(LOCALE, {
      numeric: 'auto',
    })
      .format(dateDiff, 'day')
      .replace(/^\w/, (c) => c.toUpperCase());

    return {
      color: parseInt('27ae60', 16),
      title: store['display_name'],
      footer: { text: `📥 ${relativeTime} ${dateTime}` },
      fields: [
        {
          name: STOCK,
          value: store['items_available'].toString(),
          inline: true,
        },
        { name: PRICE, value: price, inline: true },
      ],
    };
  };
}
