import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheConfig: CacheModuleOptions = {
  ttl: 300,
  isGlobal: true,
};
