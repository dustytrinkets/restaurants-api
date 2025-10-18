import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const productionRateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    // Public endpoints - IP-based limits
    {
      name: 'public-restaurants',
      ttl: 60000, // 1 minute
      limit: 60, // 60 req/min per IP
    },
    {
      name: 'public-restaurant-detail',
      ttl: 60000, // 1 minute
      limit: 120, // 120 req/min per IP
    },
    {
      name: 'public-reviews',
      ttl: 60000, // 1 minute
      limit: 60, // 60 req/min per IP
    },
    {
      name: 'auth-login',
      ttl: 60000, // 1 minute
      limit: 5, // 5 req/min per IP
    },
    {
      name: 'auth-register',
      ttl: 60000, // 1 minute
      limit: 3, // 3 req/min per IP
    },
    // Authenticated user endpoints - User-based limits
    {
      name: 'user-reviews',
      ttl: 3600000, // 1 hour
      limit: 10, // 10 per hour per user
    },
    {
      name: 'user-review-actions',
      ttl: 3600000, // 1 hour
      limit: 30, // 30 per hour per user
    },
    {
      name: 'user-favorites',
      ttl: 60000, // 1 minute
      limit: 60, // 60 per minute per user
    },
    // Admin endpoints - Soft limits with logging
    {
      name: 'admin-soft',
      ttl: 60000, // 1 minute
      limit: 1000, // Very high limit, mainly for monitoring
    },
  ],
};
