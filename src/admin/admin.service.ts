import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';
import { StatsDto } from './dto/stats.dto';
import { CacheService } from '../common/services/cache.service';
import { CACHE_KEYS, CACHE_TTL } from '../common/constants/cache.constants';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private cacheService: CacheService,
  ) {}

  async getStats(): Promise<StatsDto> {
    const cacheKey = this.cacheService.generateKey(CACHE_KEYS.ADMIN_STATS);

    const cachedResult = await this.cacheService.get<StatsDto>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const [totalUsers, totalRestaurants, totalReviews] = await Promise.all([
      this.usersRepository.count(),
      this.restaurantsRepository.count(),
      this.reviewsRepository.count(),
    ]);

    const stats = {
      totalUsers,
      totalRestaurants,
      totalReviews,
    };

    await this.cacheService.set(cacheKey, stats, CACHE_TTL.DEFAULT);

    return stats;
  }
}
