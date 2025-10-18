import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Request } from 'express';
import { User } from '../../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class CustomRateLimitGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomRateLimitGuard.name);

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const request = requestProps.context.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;
    const ip = request.ip;
    const endpoint = request.url;

    const isAdminEndpoint =
      endpoint.includes('/admin/') ||
      (endpoint.includes('/restaurants') && request.method === 'POST') ||
      (endpoint.includes('/restaurants') && request.method === 'PUT') ||
      (endpoint.includes('/restaurants') && request.method === 'DELETE');

    if (isAdminEndpoint && user?.role === UserRole.ADMIN) {
      this.logger.warn(
        `Admin endpoint accessed: ${request.method} ${endpoint} by user ${user.id} from IP ${ip}`,
        'ADMIN',
      );

      return true;
    }

    return super.handleRequest(requestProps);
  }
}
