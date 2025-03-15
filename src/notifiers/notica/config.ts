import { IsString, IsUrl } from 'class-validator';

import { NotifierConfig } from '../base/config.ts';
import { NotifierType } from '../service.ts';

export class NoticaConfig extends NotifierConfig {
  @IsUrl()
  readonly apiUrl: string;
  @IsString()
  readonly room: string;

  constructor(config: NoticaConfig) {
    super(NotifierType.NOTICA);
    this.apiUrl = config.apiUrl;
    this.room = config.room;
    this.validateConfig();
  }
}
