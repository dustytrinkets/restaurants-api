import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  generateKey(entity: string, params?: any): string {
    if (!params) {
      return entity;
    }
    return `${entity}:${JSON.stringify(params)}`;
  }

  async invalidateEntity(entity: string, id?: number): Promise<void> {
    if (id) {
      await this.del(this.generateKey(entity, { id }));
    }
  }

  async invalidateEntityList(entity: string): Promise<void> {
    await this.del(entity);
  }
}
