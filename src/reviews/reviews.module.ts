import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../common/services/cache.service';
import { LoggingService } from '../common/services/logging.service';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';

import { ReviewsController, UserReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Restaurant])],
  controllers: [ReviewsController, UserReviewsController],
  providers: [ReviewsService, LoggingService, CacheService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
