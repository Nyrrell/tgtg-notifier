import { WebhookClient, MessageEmbed } from 'discord.js';

export default class discord {
  constructor(webhookURL) {
    this.client = new WebhookClient({ url: webhookURL });
    this.client.edit({
      name: 'Too Good To Go',
      avatar: 'https://toogoodtogo.com/favicon.png'
    }).catch(e => console.error(e))
  }

  sendNotif = (store) => {
    return this.client.send({
      embeds: [
        new MessageEmbed()
          .setColor("#27ae60")
          .setTitle(store['title'])
          .setFooter(store['pickupInterval'])
          .addFields([
            { name: "Stock", value: store['items'], inline: true },
            { name: "Price", value: store['price'], inline: true }
          ])
      ]
    });
  }

  sendMonitoring = (user = null) => {
    return this.client.send({
      embeds: [
        new MessageEmbed()
          .setColor("#27ae60")
          .setTitle(`Start monitoring ${user}`)
      ]
    });
  };
}