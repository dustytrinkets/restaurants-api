import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class QueryRestaurantsDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'Asian',
    description: 'Filter by cuisine type',
  })
  @IsOptional()
  @IsString()
  cuisine?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Filter by minimum rating',
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    example: 'Manhattan',
    description: 'Filter by neighborhood',
  })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({
    example: 'cuisine_type',
    description: 'Field to sort by',
    enum: ['cuisine_type', 'rating', 'neighborhood'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['cuisine_type', 'rating', 'neighborhood'])
  sort?: string = 'cuisine_type';

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';
}
