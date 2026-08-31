/**
 * Production-ready structured logger.
 * Suppresses unnecessary logs in production and formats error traces cleanly.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

const isProduction = process.env.NODE_ENV === 'production';

function formatLog(level: LogLevel, { message, context, error }: LogPayload) {
  const timestamp = new Date().toISOString();
  const prefix = `[WithUs ${level.toUpperCase()}] [${timestamp}]`;
  
  if (level === 'error') {
    // Keep errors visible for diagnostics
    if (error) {
      // eslint-disable-next-line no-console
      console.error(prefix, message, context || '', error);
    } else {
      // eslint-disable-next-line no-console
      console.error(prefix, message, context || '');
    }
  } else if (!isProduction) {
    // eslint-disable-next-line no-console
    console.log(prefix, message, context || '');
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    formatLog('info', { message, context });
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    formatLog('warn', { message, context });
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    formatLog('error', { message, error, context });
  },
  debug: (message: string, context?: Record<string, unknown>) => {
    formatLog('debug', { message, context });
  },
};
