/**
 * AULAPUDU 2.0 - LOGGER
 * Sistema de logging centralizado
 */

export class Logger {
  static LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  constructor(options = {}) {
    this.level = options.level || 'info';
    this.context = options.context || 'App';
    this.enabled = options.enabled ?? true;
  }

  /**
   * Crea un logger hijo con contexto específico
   */
  createChild(options) {
    return new Logger({
      level: this.level,
      enabled: this.enabled,
      ...options,
      context: options.context || `${this.context}:Child`
    });
  }

  debug(message, meta = {}) {
    this.#log('debug', message, meta);
  }

  info(message, meta = {}) {
    this.#log('info', message, meta);
  }

  warn(message, meta = {}) {
    this.#log('warn', message, meta);
  }

  error(message, error, meta = {}) {
    const errorMeta = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    } : { error };

    this.#log('error', message, {
      ...meta,
      error: errorMeta
    });
  }

  #log(level, message, meta) {
    if (!this.enabled) return;

    const levelValue = Logger.LEVELS[level.toUpperCase()];
    const currentLevelValue = Logger.LEVELS[this.level.toUpperCase()];

    if (levelValue < currentLevelValue) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...meta
    };

    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](
      `[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.context}] ${message}`,
      meta
    );
  }

  setLevel(level) {
    this.level = level;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

export default Logger;