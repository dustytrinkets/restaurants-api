import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { RestaurantsModule } from '../src/restaurants/restaurants.module';
import { ReviewsModule } from '../src/reviews/reviews.module';
import { FavoritesModule } from '../src/favorites/favorites.module';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { AdminModule } from '../src/admin/admin.module';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { CustomRateLimitGuard } from '../src/common/guards/custom-rate-limit.guard';
import { getRateLimitConfig } from '../src/common/config/rate-limit.factory';
import { LoggingService } from '../src/common/services/logging.service';
import { CacheService } from '../src/common/services/cache.service';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { cacheConfig } from '../src/common/config/cache.config';
import { MigrationModule } from '../src/common/modules/migration.module';
import { testDatabaseConfig } from './test-database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(testDatabaseConfig),
    ThrottlerModule.forRoot(getRateLimitConfig()),
    CacheModule.register(cacheConfig),
    RestaurantsModule,
    ReviewsModule,
    FavoritesModule,
    AuthModule,
    UsersModule,
    AdminModule,
    MigrationModule,
  ],
  providers: [
    LoggingService,
    CacheService,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: CustomRateLimitGuard,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class TestAppModule {}
