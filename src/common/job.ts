import { Cron } from 'croner';

import { CRON_SCHEDULE } from '../config.js';

export const JOB: Cron = Cron(CRON_SCHEDULE, { protect: true });
