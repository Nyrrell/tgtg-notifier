import { PRICE, STOCK } from '../../config.ts';
import { Notifier } from '../base/notifier.ts';
import { NoticaConfig } from './config.ts';

export class Notica extends Notifier {
  protected readonly request: Request;
  protected readonly config: NoticaConfig;

  constructor(config: NoticaConfig) {
    super();
    this.config = new NoticaConfig(config);
    this.request = new Request(`${this.config.apiUrl}/${this.config.room}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  protected async sendInfo(message: string): Promise<void> {
    await fetch(this.request, { body: `d:${message}` }).catch(this.error);
  }

  protected async sendItem(item: SENDABLE_ITEM): Promise<void> {
    await fetch(this.request, {
      body:
        `d:${item.name}\n` +
        `${STOCK} : ${item.available.padEnd(6)} ${PRICE} : ${item.price}\n` +
        `📤 ${item.pickupDate} ${item.pickupTime}`,
    }).catch(this.error);
  }
}
