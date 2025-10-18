import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';
import { ReviewsModule } from '../reviews/reviews.module';
import { LoggingService } from '../common/services/logging.service';
import { CacheService } from '../common/services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Review]), ReviewsModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, LoggingService, CacheService],
})
export class RestaurantsModule {}
