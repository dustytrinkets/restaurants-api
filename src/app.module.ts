import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'restaurants.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    ThrottlerModule.forRoot(getRateLimitConfig()),
    CacheModule.register(cacheConfig),
    RestaurantsModule,
    ReviewsModule,
    FavoritesModule,
    AuthModule,
    UsersModule,
    AdminModule,
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
