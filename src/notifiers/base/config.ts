import { validateSync } from 'class-validator';

import { NotifierType } from '../service.ts';

export abstract class NotifierConfig {
  type: NotifierType;

  protected constructor(type: NotifierType) {
    this.type = type;
  }

  protected validateConfig() {
    const errors = validateSync(this, { validationError: { target: false } });
    if (errors.length > 0) {
      throw JSON.stringify({ notifier: this.type, status: 'Invalid configuration', errors }, null, 2);
    }
  }
}
