import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';
import { StatsDto } from './dto/stats.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async getStats(): Promise<StatsDto> {
    const [totalUsers, totalRestaurants, totalReviews] = await Promise.all([
      this.usersRepository.count(),
      this.restaurantsRepository.count(),
      this.reviewsRepository.count(),
    ]);

    return {
      totalUsers,
      totalRestaurants,
      totalReviews,
    };
  }
}
