import { Request } from 'express';

import { UserRole } from '../enums/user-role.enum';

export interface AuthenticatedRequest extends Request {
  user?: { role: UserRole };
}
