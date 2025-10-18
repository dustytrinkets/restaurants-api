import { ApiProperty } from '@nestjs/swagger';

export class StatsDto {
  @ApiProperty({
    example: 150,
    description: 'Total number of users',
  })
  totalUsers: number;

  @ApiProperty({
    example: 25,
    description: 'Total number of restaurants',
  })
  totalRestaurants: number;

  @ApiProperty({
    example: 500,
    description: 'Total number of reviews',
  })
  totalReviews: number;
}
