import { NotifierService } from './notifierService.js';
import { GotifyConfig } from './config/index.js';
import { PRICE, STOCK } from '../config.js';
import { logger } from '../utils.js';

export class Gotify extends NotifierService {
  protected readonly request: Request;
  protected readonly config: GotifyConfig;

  constructor(config: GotifyConfig) {
    super();
    this.config = new GotifyConfig(config);
    this.request = new Request(`${this.config.apiUrl}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${this.config.token}` },
    });
  }

  protected async sendInfo(message: string): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        message: message,
      }),
    }).catch((reason) => logger.warn(reason));
  }

  protected async sendItem(item: PARSE_TGTG_ITEM): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        title: item.name,
        message: `${STOCK} : ${item.available.padEnd(6)} ${PRICE} : ${item.price}  
        📤 ${item.pickupDate} ${item.pickupTime}`,
        ...(this.config.priority && { priority: this.config.priority }),
        extras: {
          'client::display': { contentType: 'text/markdown' },
          'client::notification': { click: { url: `https://share.toogoodtogo.com/item/${item.id}` } },
        },
      }),
    }).catch((reason) => logger.warn(reason));
  }
}
