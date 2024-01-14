import { NotificationType, NotifierService } from './notifierService.js';
import { SignalConfig } from './config/index.js';
import { PRICE, STOCK } from '../config.js';
import { logger } from '../utils.js';

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
      number: this.config.number,
      recipients: this.config.recipients,
    };
  }

  private async sendInfo(message: string): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultBody(),
        message: message,
      }),
    }).catch((reason) => logger.warn(reason));
  }

  private async sendItem(item: PARSE_TGTG_ITEM): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultBody(),
        message:
          `**${item.name}**\n` +
          `${STOCK} : ${item.available.padEnd(6)} ${PRICE} : ${item.price}\n` +
          `📤 ${item.pickupDate} ${item.pickupTime}`,
        text_mode: 'styled',
      }),
    }).catch((reason) => logger.warn(reason));
  }
}
