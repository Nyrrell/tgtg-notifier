import { IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

import { NotifierType } from '../notifierService.js';
import { NotifierConfig } from './notifierConfig.js';

export class NtfyConfig extends NotifierConfig {
  readonly icon = 'https://cdn.jsdelivr.net/gh/Nyrrell/tgtg-notifier@master/media/logo.png';
  @IsUrl()
  readonly apiUrl: string;
  @IsOptional()
  @IsString()
  readonly token?: string;
  @IsString()
  readonly topic: string;
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  readonly priority?: number;

  constructor(config: NtfyConfig) {
    super(NotifierType.NTFY);
    this.apiUrl = config.apiUrl;
    this.token = config?.token;
    this.topic = config.topic;
    this.priority = config?.priority;
    this.validateConfig();
  }
}
