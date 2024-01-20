import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

import { NotifierType } from '../notifierService.js';
import { NotifierConfig } from './notifierConfig.js';

export class GotifyConfig extends NotifierConfig {
  @IsUrl()
  readonly apiUrl: string;
  @IsString()
  readonly token: string;
  @IsInt()
  @IsOptional()
  readonly priority?: number;

  constructor(config: GotifyConfig) {
    super(NotifierType.GOTIFY);
    this.apiUrl = config.apiUrl;
    this.token = config.token;
    this.priority = config?.priority;
    this.validateConfig();
  }
}
