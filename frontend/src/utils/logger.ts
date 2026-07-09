/**
 * Structured logger — wraps console methods so they are silent in production.
 * In development (import.meta.env.DEV === true) all methods behave normally.
 * In production, errors are swallowed unless you wire in a remote service (e.g. Sentry).
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`[LOG] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, err?: unknown) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, err);
    }
    // TODO: In production, send to a remote error tracking service:
    // captureException(err, { extra: { message } });
  },
};

export default logger;
