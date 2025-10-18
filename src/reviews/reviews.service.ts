import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Restaurant } from '../entities/restaurant.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async findByRestaurant(restaurantId: number): Promise<Review[]> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    return await this.reviewsRepository.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
    });
  }
}
