import type { NotifierConfig } from './base/config.ts';
import type { Notifier } from './base/notifier.ts';
import {
  type TelegramConfig,
  type DiscordConfig,
  type GotifyConfig,
  type NoticaConfig,
  type SignalConfig,
  type NtfyConfig,
  Telegram,
  Discord,
  Gotify,
  Notica,
  Signal,
  Ntfy,
} from './index.ts';

export enum NotifierType {
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  GOTIFY = 'gotify',
  NOTICA = 'notica',
  SIGNAL = 'signal',
  NTFY = 'ntfy',
}

export enum NotificationType {
  START,
  NEW_ITEM,
}

export const setNotifiers = (notifierConfigs: Array<NotifierConfig>): Notifier[] => {
  return notifierConfigs.map((notifier: NotifierConfig): Notifier => {
    switch (notifier.type) {
      case NotifierType.DISCORD:
        return new Discord(notifier as DiscordConfig);
      case NotifierType.GOTIFY:
        return new Gotify(notifier as GotifyConfig);
      case NotifierType.SIGNAL:
        return new Signal(notifier as SignalConfig);
      case NotifierType.TELEGRAM:
        return new Telegram(notifier as TelegramConfig);
      case NotifierType.NTFY:
        return new Ntfy(notifier as NtfyConfig);
      case NotifierType.NOTICA:
        return new Notica(notifier as NoticaConfig);
    }
  });
};
