import { NotifierType } from '../notifierService.js';
import { NotifierConfig } from './notifierConfig.js';

export class SignalConfig extends NotifierConfig {
  readonly apiUrl: string;
  readonly number: string;
  readonly recipients: Array<string>;

  constructor(config: SignalConfig) {
    super(NotifierType.SIGNAL);
    this.apiUrl = config.apiUrl;
    this.number = config.number;
    this.recipients = config.recipients;
  }
}
