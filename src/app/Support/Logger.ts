import { app as appConfig } from '../../config/app';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger class for NodeRex framework
 * Provides structured logging with different levels
 */
export class Logger {
  private static level: LogLevel = appConfig.debug ? LogLevel.DEBUG : LogLevel.INFO;

  /**
   * Set log level
   */
  public static setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  public static getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Log debug message
   */
  public static debug(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('DEBUG', message, context);
    }
  }

  /**
   * Log info message
   */
  public static info(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.INFO) {
      this.log('INFO', message, context);
    }
  }

  /**
   * Log warning message
   */
  public static warn(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.WARN) {
      this.log('WARN', message, context);
    }
  }

  /**
   * Log error message
   */
  public static error(message: string, error?: Error | any, context?: Record<string, any>): void {
    if (this.level <= LogLevel.ERROR) {
      const errorContext = error instanceof Error 
        ? { ...context, error: error.message, stack: error.stack }
        : { ...context, error };
      this.log('ERROR', message, errorContext);
    }
  }

  /**
   * Internal log method
   */
  private static log(level: string, message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const logEntry: any = {
      timestamp,
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      logEntry.context = context;
    }

    // Format log entry
    const logString = `[${timestamp}] ${level}: ${message}`;
    
    // Output based on level
    switch (level) {
      case 'DEBUG':
        console.debug(logString, context || '');
        break;
      case 'INFO':
        console.info(logString, context || '');
        break;
      case 'WARN':
        console.warn(logString, context || '');
        break;
      case 'ERROR':
        console.error(logString, context || '');
        break;
      default:
        console.log(logString, context || '');
    }
  }

  /**
   * Log HTTP request
   */
  public static request(req: any, res: any, responseTime?: number): void {
    const context = {
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    };

    if (res.statusCode >= 400) {
      this.warn(`${req.method} ${req.path} - ${res.statusCode}`, context);
    } else {
      this.info(`${req.method} ${req.path} - ${res.statusCode}`, context);
    }
  }

  /**
   * Log database query
   */
  public static query(query: string, parameters?: any[], duration?: number): void {
    if (this.level <= LogLevel.DEBUG) {
      this.debug('Database Query', {
        query,
        parameters,
        duration: duration ? `${duration}ms` : undefined,
      });
    }
  }
}
