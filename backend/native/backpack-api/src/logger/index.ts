class Logger {
  private constructor() {}

  static getInstance() {
    return new Logger();
  }

  log(message: string) {
    console.log(message);
  }

  error(message: string) {
    console.error(message);
  }

  warn(message: string) {
    console.warn(message);
  }
}

export const logger = Logger.getInstance();
