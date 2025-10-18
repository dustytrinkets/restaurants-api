import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);

  logMessage(
    message: string,
    context?: string,
    level: 'log' | 'warn' | 'error' = 'log',
  ) {
    const fullMessage = context ? `[${context}] ${message}` : message;
    this.logger[level](fullMessage);
  }
}
