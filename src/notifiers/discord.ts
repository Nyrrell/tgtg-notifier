import { NotificationType, NotifierService } from './notifierService.js';
import { DiscordConfig } from './config/index.js';
import { PRICE, STOCK } from '../config.js';
import { logger } from '../utils.js';

export class Discord extends NotifierService {
  protected readonly request: Request;
  protected readonly config: DiscordConfig;

  constructor(config: DiscordConfig) {
    super();
    this.config = new DiscordConfig(config);
    this.request = new Request(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  sendNotification(type: NotificationType, data: string | PARSE_TGTG_ITEM): Promise<void> {
    switch (type) {
      case NotificationType.START:
        return this.sendInfo(data as string);
      case NotificationType.NEW_ITEM:
        return this.sendItem(data as PARSE_TGTG_ITEM);
    }
  }

  private getDefaultBody() {
    return {
      username: this.config.username,
      avatar_url: this.config.avatar,
    };
  }

  private async sendItem(item: PARSE_TGTG_ITEM): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultBody(),
        embeds: [
          {
            color: parseInt('27ae60', 16),
            title: item.name,
            url: `https://share.toogoodtogo.com/item/${item.id}`,
            footer: { text: `📤 ${item.pickupDate} ${item.pickupTime}` },
            fields: [
              {
                name: STOCK,
                value: item.available,
                inline: true,
              },
              { name: PRICE, value: item.price, inline: true },
            ],
          },
        ],
      }),
    }).catch((reason) => logger.error(reason));
  }

  private async sendInfo(message: string): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultBody(),
        embeds: [
          {
            color: parseInt('2980b9', 16),
            title: message,
          },
        ],
      }),
    }).catch((reason) => logger.warn(reason));
  }
}
