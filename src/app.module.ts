import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CustomRateLimitGuard } from './common/guards/custom-rate-limit.guard';
import { getRateLimitConfig } from './common/config/rate-limit.factory';
import { LoggingService } from './common/services/logging.service';
import { CacheService } from './common/services/cache.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { cacheConfig } from './common/config/cache.config';
import { MigrationModule } from './common/modules/migration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://localhost/restaurants_dev',
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
