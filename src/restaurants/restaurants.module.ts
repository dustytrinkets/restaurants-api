import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../common/services/cache.service';
import { LoggingService } from '../common/services/logging.service';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';
import { ReviewsModule } from '../reviews/reviews.module';

import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Review]), ReviewsModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, LoggingService, CacheService],
})
export class RestaurantsModule {}
