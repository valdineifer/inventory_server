/* eslint-disable @typescript-eslint/no-explicit-any */
import winston from 'winston';
import Transport from 'winston-transport';
import * as Sentry from '@sentry/remix';

enum SentrySeverity {
  Debug = 'debug',
  Log = 'log',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Fatal = 'fatal',
}

const DEFAULT_LEVELS_MAP = {
  silly: SentrySeverity.Debug,
  verbose: SentrySeverity.Debug,
  info: SentrySeverity.Info,
  debug: SentrySeverity.Debug,
  warn: SentrySeverity.Warning,
  error: SentrySeverity.Error,
};

class ExtendedError extends Error {
  constructor(info: any) {
    super(info.message);

    this.name = info.name || 'Error';
    if (info.stack && typeof info.stack === 'string') {
      this.stack = info.stack;
    }
  }
}

class SentryTransport extends Transport {
  constructor(opts: winston.transport.TransportStreamOptions) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  public log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    if (this.silent) return callback();

    const { message, tags, user, level, ...meta } = info;

    const sentryLevel = DEFAULT_LEVELS_MAP[level as keyof typeof DEFAULT_LEVELS_MAP];

    Sentry.withScope((scope) => {
      scope.setExtras(meta);

      if (tags !== undefined && SentryTransport.isObject(tags)) {
        scope.setTags(tags);
      }

      if (user !== undefined && SentryTransport.isObject(user)) {
        scope.setUser(user);
      }

      // Capturing Errors / Exceptions
      if (SentryTransport.shouldCaptureAsException(sentryLevel)) {
        const error = Object.values(info)
          .find((value) => value instanceof Error) ?? new ExtendedError(info);

        Sentry.captureException(error, { tags, level: sentryLevel });
        return;
      }

      // Capturing Messages
      Sentry.captureMessage(message, sentryLevel);
    });

    return callback();
  }

  private static isObject(obj: any) {
    const type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
  }

  private static shouldCaptureAsException(level: Sentry.SeverityLevel) {
    return level === SentrySeverity.Fatal || level === SentrySeverity.Error;
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new SentryTransport({}),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;