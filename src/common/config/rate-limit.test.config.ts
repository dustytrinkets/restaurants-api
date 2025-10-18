import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const testRateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    // Test environment - Very high limits to avoid test interference
    {
      name: 'public-restaurants',
      ttl: 60000, // 1 minute
      limit: 10000, // 10k req/min per IP (effectively unlimited for tests)
    },
    {
      name: 'public-restaurant-detail',
      ttl: 60000, // 1 minute
      limit: 10000, // 10k req/min per IP
    },
    {
      name: 'public-reviews',
      ttl: 60000, // 1 minute
      limit: 10000, // 10k req/min per IP
    },
    {
      name: 'auth-login',
      ttl: 60000, // 1 minute
      limit: 10000, // 10k req/min per IP
    },
    {
      name: 'auth-register',
      ttl: 60000, // 1 minute
      limit: 10000, // 10k req/min per IP
    },
    // Authenticated user endpoints - User-based limits
    {
      name: 'user-reviews',
      ttl: 3600000, // 1 hour
      limit: 10000, // 10k per hour per user
    },
    {
      name: 'user-review-actions',
      ttl: 3600000, // 1 hour
      limit: 10000, // 10k per hour per user
    },
    {
      name: 'user-favorites',
      ttl: 60000, // 1 minute
      limit: 10000, // 10k per minute per user
    },
    // Admin endpoints - Soft limits with logging
    {
      name: 'admin-soft',
      ttl: 60000, // 1 minute
      limit: 10000, // 10k limit for tests
    },
  ],
};
