import config from '../config/index.js';

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  HTTP: 3,
  DEBUG: 4,
};

const colors = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  HTTP: '\x1b[35m',  // Magenta
  DEBUG: '\x1b[37m', // White
  RESET: '\x1b[0m',
};

class Logger {
  constructor() {
    this.level = LogLevel[config.logLevel?.toUpperCase()] || LogLevel.INFO;
  }

  log(level, message, meta = {}) {
    if (LogLevel[level] > this.level) return;

    const timestamp = new Date().toISOString();
    const color = colors[level];
    const reset = colors.RESET;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';

    console.log(`${color}[${timestamp}] [${level}]${reset} ${message}${metaStr}`);
  }

  error(message, meta) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta) {
    this.log('WARN', message, meta);
  }

  info(message, meta) {
    this.log('INFO', message, meta);
  }

  http(message, meta) {
    this.log('HTTP', message, meta);
  }

  debug(message, meta) {
    this.log('DEBUG', message, meta);
  }
}

export default new Logger();
