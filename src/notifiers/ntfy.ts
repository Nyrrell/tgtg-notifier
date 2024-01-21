import { NotifierService } from './notifierService.js';
import { NtfyConfig } from './config/index.js';
import { PRICE, STOCK } from '../config.js';

export class Ntfy extends NotifierService {
  protected readonly request: Request;
  protected readonly config: NtfyConfig;

  constructor(config: NtfyConfig) {
    super();
    this.config = new NtfyConfig(config);
    this.request = new Request(`${this.config.apiUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${this.config.token}` },
    });
  }

  private getDefaultPayload() {
    return {
      topic: this.config.topic,
      icon: this.config.icon,
    };
  }

  protected async sendInfo(message: string): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        message: message,
      }),
    })
      .then(this.response)
      .catch(this.error);
  }

  protected async sendItem(item: PARSE_TGTG_ITEM): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        title: item.name,
        message:
          `${STOCK} : ${item.available.padEnd(6)} ${PRICE} : ${item.price}\n` +
          `📤 ${item.pickupDate} ${item.pickupTime}`,
        ...(this.config.priority && { priority: this.config.priority }),
        click: `https://share.toogoodtogo.com/item/${item.id}`,
        markdown: true,
      }),
    })
      .then(this.response)
      .catch(this.error);
  }
}
