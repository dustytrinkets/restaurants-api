import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CACHE_KEYS, CACHE_TTL } from '../common/constants/cache.constants';
import { CacheService } from '../common/services/cache.service';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';

import {
  TopRestaurantsStatsDto,
  RestaurantStatsDto,
} from './dto/restaurant-stats.dto';
import { StatsDto } from './dto/stats.dto';
import { RestaurantStatsRaw } from './interfaces/restaurant-stats-raw.interface';

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

  async getTopRestaurantsStats(): Promise<TopRestaurantsStatsDto> {
    const [topRated, mostReviewed] = await Promise.all([
      this.getRestaurantStats('rating'),
      this.getRestaurantStats('reviews'),
    ]);

    return { topRated, mostReviewed };
  }

  private async getRestaurantStats(
    sortBy: 'rating' | 'reviews',
  ): Promise<RestaurantStatsDto[]> {
    const query = this.restaurantsRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.reviews', 'review')
      .select([
        'restaurant.id',
        'restaurant.name',
        'restaurant.neighborhood',
        'restaurant.cuisine_type',
        'AVG(review.rating) as averageRating',
        'COUNT(review.id) as reviewCount',
      ])
      .groupBy(
        'restaurant.id, restaurant.name, restaurant.neighborhood, restaurant.cuisine_type',
      )
      .having('COUNT(review.id) > 0')
      .limit(3);

    if (sortBy === 'rating') {
      query
        .orderBy('AVG(review.rating)', 'DESC')
        .addOrderBy('COUNT(review.id)', 'DESC');
    } else {
      query
        .orderBy('COUNT(review.id)', 'DESC')
        .addOrderBy('AVG(review.rating)', 'DESC');
    }

    const results = await query.getRawMany<RestaurantStatsRaw>();
    return this.mapRawResults(results);
  }

  private mapRawResults(results: RestaurantStatsRaw[]): RestaurantStatsDto[] {
    return results.map((result) => ({
      id: result.restaurant_id,
      name: result.restaurant_name,
      neighborhood: result.restaurant_neighborhood,
      cuisine_type: result.restaurant_cuisine_type,
      averageRating: result.averagerating
        ? parseFloat(result.averagerating)
        : 0,
      reviewCount: result.reviewcount ? parseInt(result.reviewcount) : 0,
    }));
  }
}
