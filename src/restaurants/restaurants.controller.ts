import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';

import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';
import { ReviewsService } from '../reviews/reviews.service';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { QueryRestaurantsDto } from './dto/query-restaurants.dto';
import { RestaurantWithRatingDto } from './dto/restaurant-with-rating.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantWithRating } from './interfaces/restaurant-with-rating.interface';
import { RestaurantsService } from './restaurants.service';

@ApiTags('restaurants')
@Controller('restaurants')
@UseGuards(RolesGuard)
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({
    status: 201,
    description: 'The restaurant has been successfully created.',
    type: Restaurant,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @Public()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get restaurants with pagination, filtering, and sorting',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'cuisine',
    required: false,
    description: 'Filter by cuisine type',
  })
  @ApiQuery({
    name: 'rating',
    required: false,
    description: 'Filter by minimum rating',
  })
  @ApiQuery({
    name: 'neighborhood',
    required: false,
    description: 'Filter by neighborhood',
  })
  @ApiQuery({ name: 'sort', required: false, description: 'Field to sort by' })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order (asc/desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated restaurants with metadata.',
    type: PaginatedResponseDto<RestaurantWithRating>,
  })
  async findAll(@Query() queryDto: QueryRestaurantsDto) {
    const result = await this.restaurantsService.findAll(queryDto);
    return {
      ...result,
      data: result.data.map((r: RestaurantWithRating) =>
        plainToInstance(RestaurantWithRatingDto, r),
      ),
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a restaurant by id with average rating' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the restaurant with average rating.',
    type: RestaurantWithRatingDto,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  async findOne(@Param('id') id: string) {
    const restaurant = await this.restaurantsService.findOne(+id);
    return plainToInstance(RestaurantWithRatingDto, restaurant);
  }

  @Get(':id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get all reviews for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all reviews for the restaurant.',
    type: [Review],
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  async getReviews(@Param('id') id: string) {
    const reviews = await this.reviewsService.findByRestaurant(+id);
    return plainToInstance(Review, reviews);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'The restaurant has been successfully updated.',
    type: Restaurant,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(+id, updateRestaurantDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 204,
    description: 'The restaurant has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(+id);
  }
}
