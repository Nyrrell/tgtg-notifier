import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

import { NotifierConfig } from '../base/config.ts';
import { NotifierType } from '../service.ts';

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
