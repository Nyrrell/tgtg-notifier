import { NotifierService } from './notifierService.js';
import { SignalConfig } from './config/index.js';
import { logger } from '../common/logger.js';
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
    }).catch((reason) => logger.warn(reason));
  }

  protected async sendItem(item: PARSE_TGTG_ITEM): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        message:
          `**${item.name}**\n` +
          `${STOCK} : ${item.available.padEnd(6)} ${PRICE} : ${item.price}\n` +
          `📤 ${item.pickupDate} ${item.pickupTime}`,
        text_mode: 'styled',
      }),
    }).catch((reason) => logger.warn(reason));
  }
}
