import { NotifierType } from '../notifierService.js';
import { NotifierConfig } from './notifierConfig.js';

export class GotifyConfig extends NotifierConfig {
  apiUrl: string;
  token: string;
  priority = 5;

  constructor(config: GotifyConfig) {
    super(NotifierType.GOTIFY);
    this.apiUrl = config.apiUrl;
    this.token = config.token;
    if (config?.priority) {
      this.priority = config.priority;
    }
  }
}
