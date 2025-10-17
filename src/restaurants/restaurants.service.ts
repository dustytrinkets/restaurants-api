import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantsDto } from './dto/query-restaurants.dto';
import {
  calculateAverageRatings,
  filterAndSortByRating,
} from './helpers/rating.helper';
import { buildWhereConditions, buildOrderBy } from './helpers/query.helper';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = this.restaurantsRepository.create(createRestaurantDto);
    return await this.restaurantsRepository.save(restaurant);
  }

  async findAll(queryDto: QueryRestaurantsDto): Promise<{
    data: (Restaurant & { averageRating: number })[];
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

    const where = buildWhereConditions({ cuisine, neighborhood });
    const orderBy = buildOrderBy(sort, order);

    const [restaurants, totalCount] =
      await this.restaurantsRepository.findAndCount({
        where,
        relations: ['reviews'],
        order: orderBy,
        skip,
        take: limit,
      });

    const restaurantsWithRatings = calculateAverageRatings(restaurants);

    const needsRatingProcessing = rating !== undefined || sort === 'rating';
    const filteredData = needsRatingProcessing
      ? filterAndSortByRating(restaurantsWithRatings, { rating, sort, order })
      : restaurantsWithRatings;

    return {
      data: filteredData,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id },
      relations: ['reviews'],
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async update(
    id: number,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    Object.assign(restaurant, updateRestaurantDto);
    return await this.restaurantsRepository.save(restaurant);
  }

  async remove(id: number): Promise<void> {
    const restaurant = await this.findOne(id);
    await this.restaurantsRepository.remove(restaurant);
  }
}
