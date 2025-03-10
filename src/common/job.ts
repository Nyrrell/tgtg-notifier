import { Cron } from 'croner';

import { CRON_SCHEDULE } from '../config.ts';

export const JOB: Cron = new Cron(CRON_SCHEDULE, { protect: true });
