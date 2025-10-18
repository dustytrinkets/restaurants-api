# Rate Limiting Configuration

This directory contains environment-specific rate limiting configurations for the restaurants API.

## Configuration Files

`rate-limit.factory.ts`
Main factory that selects the appropriate configuration based on `NODE_ENV`.

`rate-limit.production.config.ts`
Production rate limits with strict thresholds:
- **Public endpoints**: 60 req/min for restaurants, 5 req/min for auth
- **User endpoints**: 10 reviews/hour, 60 favorites/minute
- **Admin endpoints**: Soft limits with logging

`rate-limit.test.config.ts`
Test environment with very high limits (10,000 req/min) to avoid test interference.

`environment.config.ts`
Environment detection utilities and constants.

## Environment Behavior

| Environment | Rate Limits | Purpose |
|-------------|-------------|---------|
| `test` | 10,000 req/min | No test interference |
| `development` | 10,000 req/min | No development interference |
| `production` | Strict limits | Security & performance |

## Rate Limit Categories

- **Public**: IP-based limits for unauthenticated endpoints
- **User**: User-based limits for authenticated operations  
- **Admin**: Soft limits with monitoring for admin actions

## Custom Rate Limit Guard

The `CustomRateLimitGuard` (located in `src/common/guards/custom-rate-limit.guard.ts`) extends the default `ThrottlerGuard` to provide:

- **Admin endpoint detection**: Automatically identifies admin endpoints
- **Soft limits for admins**: Logs admin access but doesn't block requests
- **Enhanced logging**: Tracks admin endpoint usage with user and IP information

### Admin Endpoint Detection

The guard automatically detects admin endpoints based on:
- URLs containing `/admin/`
- Restaurant CRUD operations (`POST`, `PUT`, `DELETE` on `/restaurants`)