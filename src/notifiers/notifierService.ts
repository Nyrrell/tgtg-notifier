import { NotifierConfig } from './config/notifierConfig.js';

export abstract class NotifierService {
  protected abstract readonly request: Request;
  protected abstract readonly config: NotifierConfig;

  sendNotification(type: NotificationType, payload: string | PARSE_TGTG_ITEM): Promise<void> {
    switch (type) {
      case NotificationType.START:
        return this.sendInfo(payload as string);
      case NotificationType.NEW_ITEM:
        return this.sendItem(payload as PARSE_TGTG_ITEM);
    }
  }

  protected abstract sendInfo(payload: string): Promise<void>;

  protected abstract sendItem(payload: PARSE_TGTG_ITEM): Promise<void>;

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
