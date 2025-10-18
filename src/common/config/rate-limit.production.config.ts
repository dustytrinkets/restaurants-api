import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const productionRateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'public-restaurants',
      ttl: 60000,
      limit: 60,
    },
    {
      name: 'public-restaurant-detail',
      ttl: 60000,
      limit: 120,
    },
    {
      name: 'public-reviews',
      ttl: 60000,
      limit: 60,
    },
    {
      name: 'auth-login',
      ttl: 60000,
      limit: 5,
    },
    {
      name: 'auth-register',
      ttl: 60000,
      limit: 3,
    },
    {
      name: 'user-reviews',
      ttl: 3600000,
      limit: 10,
    },
    {
      name: 'user-review-actions',
      ttl: 3600000,
      limit: 30,
    },
    {
      name: 'user-favorites',
      ttl: 60000,
      limit: 60,
    },

    {
      name: 'admin-soft',
      ttl: 60000,
      limit: 1000,
    },
  ],
};
