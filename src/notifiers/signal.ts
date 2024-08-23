import { NotifierService } from './notifierService.js';
import { SignalConfig } from './config/index.js';
import { PRICE, STOCK } from '../config.js';

export class Signal extends NotifierService {
  protected readonly request: Request;
  protected readonly config: SignalConfig;

  constructor(config: SignalConfig) {
    super();
    this.config = new SignalConfig(config);
    this.request = new Request(`${this.config.apiUrl}/v2/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private getDefaultPayload() {
    return {
      number: this.config.number,
      recipients: this.config.recipients,
    };
  }

  protected async sendInfo(message: string): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        message: message,
      }),
    }).catch(this.error);
  }

  protected async sendItem(item: SENDABLE_ITEM): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        message:
          `**${item.name}**\n` +
          `${STOCK} : ${item.available.padEnd(6)} ${PRICE} : ${item.price}\n` +
          `📤 ${item.pickupDate} ${item.pickupTime}`,
        text_mode: 'styled',
      }),
    }).catch(this.error);
  }
}
