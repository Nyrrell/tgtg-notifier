import { IsUrl } from 'class-validator';

import { NotifierType } from '../notifierService.js';
import { NotifierConfig } from './notifierConfig.js';

export class DiscordConfig extends NotifierConfig {
  readonly avatar = 'https://cdn.jsdelivr.net/gh/Nyrrell/tgtg-notifier@master/media/logo.png';
  readonly username = 'Too Good To Go';
  @IsUrl()
  readonly webhookUrl: string;

  constructor(config: DiscordConfig) {
    super(NotifierType.DISCORD);
    this.webhookUrl = config.webhookUrl;
    this.validateConfig();
  }
}
