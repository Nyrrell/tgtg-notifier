import { Logger, format, transports, createLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { LOG_LEVEL } from '../config.ts';

const transportConsole: transports.ConsoleTransportInstance = new transports.Console({
  format: format.colorize({
    all: true,
  }),
});

const transportFile: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '7d',
});

export const logger: Logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(
    format.splat(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      if (stack) {
        log += `\n ${stack}`;
      }
      return log;
    })
  ),
  transports: [transportConsole, transportFile],
});
