import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { productionRateLimitConfig } from './rate-limit.production.config';
import { testRateLimitConfig } from './rate-limit.test.config';
import { getCurrentEnvironment, ENVIRONMENTS } from './environment.config';

export const getRateLimitConfig = (): ThrottlerModuleOptions => {
  const environment = getCurrentEnvironment();

  switch (environment) {
    case ENVIRONMENTS.TEST:
      return testRateLimitConfig;
    case ENVIRONMENTS.PRODUCTION:
      return productionRateLimitConfig;
    case ENVIRONMENTS.DEVELOPMENT:
      return testRateLimitConfig;
    default:
      return productionRateLimitConfig;
  }
};
