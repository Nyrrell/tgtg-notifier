import { IsString, IsUrl } from 'class-validator';

import { NotifierType } from '../notifierService.js';
import { NotifierConfig } from './notifierConfig.js';

export class SignalConfig extends NotifierConfig {
  @IsUrl()
  readonly apiUrl: string;
  @IsString()
  readonly number: string;
  @IsString({ each: true })
  readonly recipients: Array<string>;

  constructor(config: SignalConfig) {
    super(NotifierType.SIGNAL);
    this.apiUrl = config.apiUrl;
    this.number = config.number;
    this.recipients = config.recipients;
    this.validateConfig();
  }
}
