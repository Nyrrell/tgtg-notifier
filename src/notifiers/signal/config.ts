import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

import { NotifierConfig } from '../base/config.ts';
import { NotifierType } from '../service.ts';

export class SignalConfig extends NotifierConfig {
  @IsUrl()
  readonly apiUrl: string;
  @IsString()
  readonly number: string;
  @IsString({ each: true })
  readonly recipients: Array<string>;
  @IsBoolean()
  @IsOptional()
  readonly notifySelf?: boolean;

  constructor(config: SignalConfig) {
    super(NotifierType.SIGNAL);
    this.apiUrl = config.apiUrl;
    this.number = config.number;
    this.recipients = config.recipients;
    this.notifySelf = config?.notifySelf;
    this.validateConfig();
  }
}
