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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
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
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({
    status: 200,
    description: 'Return all restaurants.',
    type: [Restaurant],
  })
  findAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by id' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the restaurant.',
    type: Restaurant,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(+id);
  }

  @Patch(':id')
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
