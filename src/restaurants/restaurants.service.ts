import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantsDto } from './dto/query-restaurants.dto';
import {
  addAverageRatingToQuery,
  mapResultsWithAverageRating,
} from './helpers/rating.helper';
import { RestaurantWithRating } from './interfaces/restaurant-with-rating.interface';
import { LoggingService } from '../common/services/logging.service';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    private loggingService: LoggingService,
  ) {}

  async create(
    createRestaurantDto: CreateRestaurantDto,
    userId?: number,
    ip?: string,
  ): Promise<Restaurant> {
    const restaurant = this.restaurantsRepository.create(createRestaurantDto);
    const savedRestaurant = await this.restaurantsRepository.save(restaurant);

    if (userId) {
      this.loggingService.logMessage(
        `Restaurant created: ID ${savedRestaurant.id} by user ${userId} from IP: ${ip || 'unknown'}`,
        'RESTAURANT',
      );
    }

    return savedRestaurant;
  }

  async findAll(queryDto: QueryRestaurantsDto): Promise<{
    data: RestaurantWithRating[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      cuisine,
      neighborhood,
      rating,
      sort = 'name',
      order = 'asc',
    } = queryDto;

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

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<RestaurantWithRating> {
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

    if (userId) {
      this.loggingService.logMessage(
        `Restaurant updated: ID ${id} by user ${userId} from IP: ${ip || 'unknown'}`,
        'RESTAURANT',
      );
    }

    return updatedRestaurant;
  }

  async remove(id: number, userId?: number, ip?: string): Promise<void> {
    const restaurant = await this.findOne(id);
    await this.restaurantsRepository.remove(restaurant);

    if (userId) {
      this.loggingService.logMessage(
        `Restaurant deleted: ID ${id} by user ${userId} from IP: ${ip || 'unknown'}`,
        'RESTAURANT',
      );
    }
  }
}
