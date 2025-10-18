import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from '../entities/restaurant.entity';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant]), ReviewsModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
})
export class RestaurantsModule {}
