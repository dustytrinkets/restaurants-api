import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { cacheConfig } from './common/config/cache.config';
import { getRateLimitConfig } from './common/config/rate-limit.factory';
import { CustomRateLimitGuard } from './common/guards/custom-rate-limit.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MigrationModule } from './common/modules/migration.module';
import { CacheService } from './common/services/cache.service';
import { LoggingService } from './common/services/logging.service';
import { FavoritesModule } from './favorites/favorites.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
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
  controllers: [AppController],
  providers: [
    AppService,
    LoggingService,
    CacheService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomRateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
