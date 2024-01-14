import { NotifierConfig } from './config/notifierConfig.js';

export abstract class NotifierService {
  protected abstract readonly request: Request;
  protected abstract readonly config: NotifierConfig;

  abstract sendNotification(type: NotificationType, data: string | PARSE_TGTG_ITEM): Promise<void>;

  protected jsonPayload = (body: object): string => JSON.stringify(body);
  public getType = () => this.config.type;
}

export enum NotifierType {
  DISCORD = 'discord',
  GOTIFY = 'gotify',
  SIGNAL = 'signal',
}

export enum NotificationType {
  START,
  NEW_ITEM,
}
