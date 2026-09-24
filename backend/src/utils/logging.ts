import { env } from '../config/env';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  message: string;
  level: LogLevel;
  timestamp: string;
  userId?: string;
  documentId?: string;
  requestId?: string;
  durationMs?: number;
  error?: string;
  extra?: Record<string, unknown>;
}

export class Logger {
  private static format(entry: LogEntry): string {
    if (env.NODE_ENV === 'production') {
      return JSON.stringify({
        severity: entry.level.toUpperCase(),
        time: entry.timestamp,
        message: entry.message,
        userId: entry.userId,
        documentId: entry.documentId,
        requestId: entry.requestId,
        durationMs: entry.durationMs,
        error: entry.error,
        ...entry.extra,
      });
    }
    const userTag = entry.userId ? ` [user:${entry.userId}]` : '';
    const docTag = entry.documentId ? ` [doc:${entry.documentId}]` : '';
    const errTag = entry.error ? ` - Error: ${entry.error}` : '';
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}]${userTag}${docTag} ${entry.message}${errTag}`;
  }

  static info(message: string, meta: Partial<LogEntry> = {}) {
    console.log(
      this.format({
        message,
        level: 'info',
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  }

  static warn(message: string, meta: Partial<LogEntry> = {}) {
    console.warn(
      this.format({
        message,
        level: 'warn',
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  }

  static error(message: string, meta: Partial<LogEntry> = {}) {
    console.error(
      this.format({
        message,
        level: 'error',
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  }

  static debug(message: string, meta: Partial<LogEntry> = {}) {
    if (env.NODE_ENV !== 'production') {
      console.debug(
        this.format({
          message,
          level: 'debug',
          timestamp: new Date().toISOString(),
          ...meta,
        })
      );
    }
  }
}
