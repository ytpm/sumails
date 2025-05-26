/* eslint-disable no-console -- Allow */

// NOTE: A tracking system such as Sentry should replace the console

export const LogLevel = { NONE: 'NONE', ERROR: 'ERROR', WARN: 'WARN', DEBUG: 'DEBUG', ALL: 'ALL' } as const;

const LogLevelNumber = { NONE: 0, ERROR: 1, WARN: 2, DEBUG: 3, ALL: 4 } as const;

export interface LoggerOptions {
  prefix?: string;
  level?: keyof typeof LogLevel;
  showLevel?: boolean;
}

export class Logger {
  protected prefix: string;
  protected level: keyof typeof LogLevel;
  protected showLevel: boolean;

  private levelNumber: number;

  constructor({ prefix = '', level = LogLevel.ALL, showLevel = true }: LoggerOptions) {
    this.prefix = prefix;
    this.level = level;
    this.levelNumber = LogLevelNumber[this.level];
    this.showLevel = showLevel;
  }

  debug = (componentOrMessage: string, functionOrArg?: string | unknown, ...args: unknown[]): void => {
    if (this.canWrite(LogLevel.DEBUG)) {
      // Check if this is the context format (component, function, ...args)
      if (typeof functionOrArg === 'string') {
        this.write(LogLevel.DEBUG, `[${componentOrMessage}/#${functionOrArg}]:`, ...args);
      } else {
        // Standard format (message, ...args)
        const messageArgs = functionOrArg !== undefined ? [componentOrMessage, functionOrArg, ...args] : [componentOrMessage];
        this.write(LogLevel.DEBUG, ...messageArgs);
      }
    }
  };

  warn = (componentOrMessage: string, functionOrArg?: string | unknown, ...args: unknown[]): void => {
    if (this.canWrite(LogLevel.WARN)) {
      // Check if this is the context format (component, function, ...args)
      if (typeof functionOrArg === 'string') {
        this.write(LogLevel.WARN, `[${componentOrMessage}/#${functionOrArg}]:`, ...args);
      } else {
        // Standard format (message, ...args)
        const messageArgs = functionOrArg !== undefined ? [componentOrMessage, functionOrArg, ...args] : [componentOrMessage];
        this.write(LogLevel.WARN, ...messageArgs);
      }
    }
  };

  error = (componentOrMessage: string, functionOrArg?: string | unknown, ...args: unknown[]): void => {
    if (this.canWrite(LogLevel.ERROR)) {
      // Check if this is the context format (component, function, ...args)
      if (typeof functionOrArg === 'string') {
        this.write(LogLevel.ERROR, `[${componentOrMessage}/#${functionOrArg}]:`, ...args);
      } else {
        // Standard format (message, ...args)
        const messageArgs = functionOrArg !== undefined ? [componentOrMessage, functionOrArg, ...args] : [componentOrMessage];
        this.write(LogLevel.ERROR, ...messageArgs);
      }
    }
  };

  private canWrite(level: keyof typeof LogLevel): boolean {
    return this.levelNumber >= LogLevelNumber[level];
  }

  private write(level: keyof typeof LogLevel, ...args: unknown[]): void {
    let prefix = this.prefix;

    if (this.showLevel) {
      prefix = `- ${level} ${prefix}`;
    }

    if (level === LogLevel.ERROR) {
      console.error(prefix, ...args);
    } else {
      console.log(prefix, ...args);
    }
  }
}

// This can be extended to create context specific logger (Server Action, Router Handler, etc.)
// to add context information (IP, User-Agent, timestamp, etc.)

export function createLogger({ prefix, level }: LoggerOptions = {}): Logger {
  return new Logger({ prefix, level });
}
