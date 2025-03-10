import { PRICE, STOCK } from '../../config.ts';
import { Notifier } from '../base/notifier.ts';
import { TelegramConfig } from './config.ts';

export class Telegram extends Notifier {
  protected readonly request: Request;
  protected readonly config: TelegramConfig;

  constructor(config: TelegramConfig) {
    super();
    this.config = new TelegramConfig(config);
    this.request = new Request(`${this.config.apiUrl}/bot${this.config.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private getDefaultPayload() {
    return {
      chat_id: this.config.chatId,
      ...(this.config.messageThreadId && { message_thread_id: this.config.messageThreadId }),
    };
  }

  protected async sendInfo(message: string): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        text: message,
      }),
    }).catch(this.error);
  }

  protected async sendItem(item: SENDABLE_ITEM): Promise<void> {
    await fetch(this.request, {
      body: this.jsonPayload({
        ...this.getDefaultPayload(),
        text:
          `*[${item.name}](https://share.toogoodtogo.com/item/${item.id})*\n` +
          `${STOCK} : ${item.available.padEnd(6)} ${PRICE} : ${item.price}\n` +
          `📤 ${item.pickupDate} ${item.pickupTime}`,
        parse_mode: 'MarkdownV2',
        link_preview_options: {
          is_disabled: true,
        },
      }),
    }).catch(this.error);
  }
}
