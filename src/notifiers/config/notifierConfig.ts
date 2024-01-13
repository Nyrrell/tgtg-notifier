import { NotifierType } from '../notifierService.js';

export abstract class NotifierConfig {
  type: NotifierType;

  protected constructor(type: NotifierType) {
    this.type = type;
  }
}
