import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantsDto } from './dto/query-restaurants.dto';
import {
  addAverageRatingToQuery,
  mapResultsWithAverageRating,
} from './helpers/rating.helper';
import { RestaurantWithRating } from './interfaces/restaurant-with-rating.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { LoggingService } from '../common/services/logging.service';
import { CacheService } from '../common/services/cache.service';
import { CACHE_KEYS, CACHE_TTL } from '../common/constants/cache.constants';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private loggingService: LoggingService,
    private cacheService: CacheService,
  ) {}

  async create(
    createRestaurantDto: CreateRestaurantDto,
    userId?: number,
    ip?: string,
  ): Promise<Restaurant> {
    const restaurant = this.restaurantsRepository.create(createRestaurantDto);
    const savedRestaurant = await this.restaurantsRepository.save(restaurant);

    await this.cacheService.del(CACHE_KEYS.ADMIN_STATS);

    if (userId) {
      this.loggingService.logMessage(
        `Restaurant created: ID ${savedRestaurant.id} by user ${userId} from IP: ${ip || 'unknown'}`,
        'RESTAURANT',
      );
    }

    return savedRestaurant;
  }

  async findAll(
    queryDto: QueryRestaurantsDto,
  ): Promise<PaginatedResponse<RestaurantWithRating>> {
    const {
      page = 1,
      limit = 10,
      cuisine,
      neighborhood,
      rating,
      sort = 'name',
      order = 'asc',
    } = queryDto;

    const cacheKey = this.cacheService.generateKey(
      CACHE_KEYS.RESTAURANTS,
      queryDto,
    );

    const cachedResult =
      await this.cacheService.get<PaginatedResponse<RestaurantWithRating>>(
        cacheKey,
      );

    if (cachedResult) {
      return cachedResult;
    }

    const skip = (page - 1) * limit;

    const queryBuilder = addAverageRatingToQuery(
      this.restaurantsRepository.createQueryBuilder('restaurant'),
    );

    if (cuisine)
      queryBuilder.andWhere('restaurant.cuisine_type = :cuisine', { cuisine });
    if (neighborhood)
      queryBuilder.andWhere('restaurant.neighborhood = :neighborhood', {
        neighborhood,
      });
    if (rating !== undefined)
      queryBuilder.having('AVG(review.rating) >= :rating', { rating });

    const sortFields: Record<string, string> = {
      rating: 'averageRating',
      cuisine_type: 'restaurant.cuisine_type',
      neighborhood: 'restaurant.neighborhood',
      name: 'restaurant.name',
    };

    queryBuilder.addOrderBy(
      sortFields[sort] || 'restaurant.id',
      (order || 'ASC').toUpperCase() as 'ASC' | 'DESC',
    );

    queryBuilder.skip(skip).take(limit);

    const [results, total] = await Promise.all([
      queryBuilder.getRawAndEntities(),
      queryBuilder.getCount(),
    ]);

    const data = mapResultsWithAverageRating(results.entities, results.raw);

    const result = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.cacheService.set(cacheKey, result, CACHE_TTL.DEFAULT);

    return result;
  }

  async findOne(id: number): Promise<RestaurantWithRating> {
    const cacheKey = this.cacheService.generateKey(CACHE_KEYS.RESTAURANT, {
      id,
    });

    const cachedResult =
      await this.cacheService.get<RestaurantWithRating>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const queryBuilder = addAverageRatingToQuery(
      this.restaurantsRepository.createQueryBuilder('restaurant'),
    ).where('restaurant.id = :id', { id });

    const result = await queryBuilder.getRawAndEntities();

    if (!result.entities.length) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    const [restaurant] = mapResultsWithAverageRating(
      result.entities,
      result.raw,
    );

    await this.cacheService.set(cacheKey, restaurant, CACHE_TTL.LONG);

    return restaurant;
  }

  async update(
    id: number,
    updateRestaurantDto: UpdateRestaurantDto,
    userId?: number,
    ip?: string,
  ): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    Object.assign(restaurant, updateRestaurantDto);
    const updatedRestaurant = await this.restaurantsRepository.save(restaurant);

    await this.cacheService.invalidateEntity(CACHE_KEYS.RESTAURANT, id);
    await this.cacheService.invalidateEntityList(CACHE_KEYS.RESTAURANTS);
    await this.cacheService.del(CACHE_KEYS.ADMIN_STATS);

    if (userId) {
      this.loggingService.logMessage(
        `Restaurant updated: ID ${id} by user ${userId} from IP: ${ip || 'unknown'}`,
        'RESTAURANT',
      );
    }

    return updatedRestaurant;
  }

  async remove(id: number, userId?: number, ip?: string): Promise<void> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id },
      relations: ['reviews'],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    if (restaurant.reviews && restaurant.reviews.length > 0) {
      await this.reviewsRepository
        .createQueryBuilder()
        .delete()
        .from('reviews')
        .where('restaurant_id = :id', { id })
        .execute();
    }

    await this.restaurantsRepository
      .createQueryBuilder()
      .delete()
      .from('favorites')
      .where('restaurant_id = :id', { id })
      .execute();

    await this.restaurantsRepository.remove(restaurant);

    await this.cacheService.invalidateEntity(CACHE_KEYS.RESTAURANT, id);
    await this.cacheService.invalidateEntityList(CACHE_KEYS.RESTAURANTS);
    await this.cacheService.del(CACHE_KEYS.ADMIN_STATS);

    if (userId) {
      this.loggingService.logMessage(
        `Restaurant deleted: ID ${id} by user ${userId} from IP: ${ip || 'unknown'}`,
        'RESTAURANT',
      );
    }
  }
}
