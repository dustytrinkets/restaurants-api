import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 4.5,
    description: 'The review rating (0-5)',
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great food and service!',
    description: 'User comment about the restaurant',
    required: false,
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({
    example: 'October 26, 2016',
    description: 'Date of the visit to the restaurant',
    required: false,
  })
  @IsOptional()
  @IsString()
  date?: string;
}
