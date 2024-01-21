import { NotifierConfig } from './config/index.js';
import { logger } from '../common/logger.js';

export abstract class NotifierService {
  protected abstract readonly request: Request;
  protected abstract readonly config: NotifierConfig;

  public sendNotification(type: NotificationType, payload: string | PARSE_TGTG_ITEM): Promise<void> {
    switch (type) {
      case NotificationType.START:
        return this.sendInfo(payload as string);
      case NotificationType.NEW_ITEM:
        return this.sendItem(payload as PARSE_TGTG_ITEM);
    }
  }

  protected response = async (res: Response): Promise<void> => {
    if (!res.ok) throw await res.text();
  };

  protected error = (reason: String): void => logger.warn(reason.trim());

  protected abstract sendInfo(payload: string): Promise<void>;

  protected abstract sendItem(payload: PARSE_TGTG_ITEM): Promise<void>;

  protected jsonPayload = (body: object): string => JSON.stringify(body);

  public getType = () => this.config.type;
}

export enum NotifierType {
  DISCORD = 'discord',
  GOTIFY = 'gotify',
  NTFY = 'ntfy',
  SIGNAL = 'signal',
  TELEGRAM = 'telegram',
}

export enum NotificationType {
  START,
  NEW_ITEM,
}
