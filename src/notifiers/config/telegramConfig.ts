import { NotifierType } from '../notifierService.js';
import { NotifierConfig } from './notifierConfig.js';

export class TelegramConfig extends NotifierConfig {
  readonly apiUrl: string;
  readonly token: string;
  readonly chatId: string | number;
  readonly messageThreadId?: number;

  constructor(config: TelegramConfig) {
    super(NotifierType.TELEGRAM);
    this.apiUrl = config?.apiUrl || 'https://api.telegram.org';
    this.token = config.token;
    this.chatId = config.chatId;
    this.messageThreadId = config?.messageThreadId;
  }
}
