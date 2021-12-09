import { WebhookClient, MessageEmbed } from 'discord.js';
import { readFileSync } from 'fs';

const { webhook, locale, timezone } = JSON.parse(readFileSync('./config.json'));

const client = new WebhookClient({ url: webhook });

await client.edit({ name: "Too Good To Go", avatar: "https://toogoodtogo.com/favicon.png"});

const sendNotif = (store) => {

  let pickupInterval
  const title = store['display_name'];
  const logo = store['item']['logo_picture']['current_url'];
  const price = (store['item']['price_including_taxes']?.['minor_units'] / 100).toLocaleString(locale,
    {
      style: "currency",
      currency: "EUR"
    });

  if (store['pickup_interval']) {
    const formatter = new Intl.DateTimeFormat(locale, { timeZone: timezone, timeStyle: "short" });
    const pickupStart = formatter.format(new Date(store['pickup_interval']['start']));
    const pickupEnd = formatter.format(new Date(store['pickup_interval']['end']));
    pickupInterval = `Pickup interval ${pickupStart} to ${pickupEnd}`;
  }

  return client.send({
    embeds: [
      new MessageEmbed()
        .setColor("#27ae60")
        .setTitle(title)
        .setFooter(pickupInterval)
        .addFields([
          { name: "Stock", value: store['items_available'].toString(), inline: true },
          { name: "Price", value: price, inline: true }
        ])
    ]
  });
};

const sendMonitoring = (user = null) => {
  return client.send({
    embeds: [
      new MessageEmbed()
        .setColor("#27ae60")
        .setTitle(`Start monitoring ${user ? `user ${user}` : ""}`)
    ]
  });
};

export default {
  sendNotif,
  sendMonitoring
};