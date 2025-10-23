import { ApiProperty } from '@nestjs/swagger';

export class RestaurantWithRatingDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the restaurant',
  })
  id: number;

  @ApiProperty({
    example: 'Mission Chinese Food',
    description: 'The name of the restaurant',
  })
  name: string;

  @ApiProperty({
    example: 'Manhattan',
    description: 'The neighborhood where the restaurant is located',
    required: false,
  })
  neighborhood: string;

  @ApiProperty({
    example: 'Asian',
    description: 'The type of cuisine served at the restaurant',
    required: false,
  })
  cuisine_type: string;

  @ApiProperty({
    example: '171 E Broadway, New York, NY 10002',
    description: 'The address of the restaurant',
    required: false,
  })
  address: string;

  @ApiProperty({
    example: 40.7167,
    description: 'The latitude coordinate of the restaurant',
    required: false,
  })
  lat: number;

  @ApiProperty({
    example: -73.9897,
    description: 'The longitude coordinate of the restaurant',
    required: false,
  })
  lng: number;

  @ApiProperty({
    example: 4.5,
    description: 'Average rating of the restaurant',
  })
  averageRating: number;
}
