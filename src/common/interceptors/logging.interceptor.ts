import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        const { method, url, ip } = request;
        const { statusCode } = response;
        const user = (request as Request & { user?: { id: number } }).user;

        const logLevel = statusCode >= 400 ? 'warn' : 'log';
        const message = `${method} ${url} ${statusCode} - ${responseTime}ms${user ? ` (User: ${user.id})` : ''} (IP: ${ip})`;

        this.loggingService.logMessage(message, 'HTTP', logLevel);
      }),
    );
  }
}
