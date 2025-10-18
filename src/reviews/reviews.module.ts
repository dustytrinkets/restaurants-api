import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from '../entities/review.entity';
import { Restaurant } from '../entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Restaurant])],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
