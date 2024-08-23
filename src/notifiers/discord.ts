import { NotifierService } from './notifierService.js';
import { DiscordConfig } from './config/index.js';
import { PRICE, STOCK } from '../config.js';

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

  private getDefaultPayload() {
    return {
      username: this.config.username,
      avatar_url: this.config.avatar,
    };
  }

  protected async sendItem(item: SENDABLE_ITEM): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        embeds: [
          {
            color: parseInt('27ae60', 16),
            title: item.name,
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
    }).catch(this.error);
  }

  protected async sendInfo(message: string): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        embeds: [
          {
            color: parseInt('2980b9', 16),
            title: message,
          },
        ],
      }),
    }).catch(this.error);
  }
}
