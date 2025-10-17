import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateRestaurantDto {
  @ApiPropertyOptional({
    example: 'Mission Chinese Food',
    description: 'The name of the restaurant',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Manhattan',
    description: 'The neighborhood where the restaurant is located',
  })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({
    example: 'restaurant-photo.jpg',
    description: 'The photograph filename',
  })
  @IsOptional()
  @IsString()
  photograph?: string;

  @ApiPropertyOptional({
    example: '171 E Broadway, New York, NY 10002',
    description: 'The address of the restaurant',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 40.713829,
    description: 'Latitude coordinate',
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({
    example: -73.989667,
    description: 'Longitude coordinate',
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiPropertyOptional({
    example: 'restaurant-image.jpg',
    description: 'The image filename',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: 'Asian',
    description: 'The type of cuisine',
  })
  @IsOptional()
  @IsString()
  cuisine_type?: string;
}
