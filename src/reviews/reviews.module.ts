import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController, UserReviewsController } from './reviews.controller';
import { Review } from '../entities/review.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { LoggingService } from '../common/services/logging.service';
import { CacheService } from '../common/services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Restaurant])],
  controllers: [ReviewsController, UserReviewsController],
  providers: [ReviewsService, LoggingService, CacheService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
