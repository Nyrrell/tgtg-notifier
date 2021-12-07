import { WebhookClient, MessageEmbed } from 'discord.js';
import { readFileSync } from 'fs';

const { webhook, locale, timezone } = JSON.parse(readFileSync('./config.json'));

const client = new WebhookClient({ url: webhook });

export const sendNotif = async (store) => {

  let pickupInterval
  const title = store['display_name'];
  const logo = store['item']['logo_picture']['current_url'];
  const price = (store['item']['price_including_taxes']?.['minor_units'] / 100).toLocaleString(locale,
    {
      style: "currency",
      currency: "EUR"
    });

  if (store['pickup_interval']) {
    const formater = new Intl.DateTimeFormat(locale, { timeZone: timezone, timeStyle: "short" });
    const pickupStart = formater.format(new Date(store['pickup_interval']['start']));
    const pickupEnd = formater.format(new Date(store['pickup_interval']['end']));
    pickupInterval = `Pickup interval ${pickupStart} to ${pickupEnd}`;
  }

  return client.send({
    username: "Too Good To Go",
    avatarURL: logo ? logo : "https://toogoodtogo.com/favicon.png",
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
}