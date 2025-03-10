import { Logger } from 'winston';

import { parseStoreItem } from '../../common/utils.ts';
import { NotificationType } from '../service.ts';
import { logger } from '../../common/logger.ts';
import { NotifierConfig } from './config.ts';

export abstract class Notifier {
  protected abstract readonly request: Request;
  protected abstract readonly config: NotifierConfig;

  public sendNotification(type: NotificationType, payload: string | TGTG_ITEM): Promise<void> {
    switch (type) {
      case NotificationType.START:
        return this.sendInfo(payload as string);
      case NotificationType.NEW_ITEM:
        return this.sendItem(parseStoreItem(payload as TGTG_ITEM));
    }
  }

  protected response = async (res: Response): Promise<void> => {
    if (!res.ok) throw await res.text();
  };

  protected error = (reason: String): Logger => logger.warn(reason);

  protected abstract sendInfo(payload: string): Promise<void>;

  protected abstract sendItem(payload: SENDABLE_ITEM): Promise<void>;

  protected jsonPayload = (body: object): string => JSON.stringify(body);

  public getType = () => this.config.type;
}
