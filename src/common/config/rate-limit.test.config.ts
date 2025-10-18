import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const testRateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'public-restaurants',
      ttl: 60000,
      limit: 10000,
    },
    {
      name: 'public-restaurant-detail',
      ttl: 60000,
      limit: 10000,
    },
    {
      name: 'public-reviews',
      ttl: 60000,
      limit: 10000,
    },
    {
      name: 'auth-login',
      ttl: 60000,
      limit: 10000,
    },
    {
      name: 'auth-register',
      ttl: 60000,
      limit: 10000,
    },
    {
      name: 'user-reviews',
      ttl: 3600000,
      limit: 10000,
    },
    {
      name: 'user-review-actions',
      ttl: 3600000,
      limit: 10000,
    },
    {
      name: 'user-favorites',
      ttl: 60000,
      limit: 10000,
    },
    {
      name: 'admin-soft',
      ttl: 60000,
      limit: 10000,
    },
  ],
};
