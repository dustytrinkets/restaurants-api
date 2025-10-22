import { ApiProperty } from '@nestjs/swagger';

export class RestaurantStatsDto {
  @ApiProperty({
    example: 1,
    description: 'Restaurant ID',
  })
  id: number;

  @ApiProperty({
    example: 'Mission Chinese Food',
    description: 'Restaurant name',
  })
  name: string;

  @ApiProperty({
    example: 'Manhattan',
    description: 'Restaurant neighborhood',
    required: false,
  })
  neighborhood?: string;

  @ApiProperty({
    example: 'Asian',
    description: 'Restaurant cuisine type',
    required: false,
  })
  cuisine_type?: string;

  @ApiProperty({
    example: 4.5,
    description: 'Average rating of the restaurant',
  })
  averageRating: number;

  @ApiProperty({
    example: 25,
    description: 'Total number of reviews for the restaurant',
  })
  reviewCount: number;
}

export class TopRestaurantsStatsDto {
  @ApiProperty({
    description: 'Top 3 rated restaurants',
    type: [RestaurantStatsDto],
  })
  topRated: RestaurantStatsDto[];

  @ApiProperty({
    description: 'Top 3 most reviewed restaurants',
    type: [RestaurantStatsDto],
  })
  mostReviewed: RestaurantStatsDto[];
}
