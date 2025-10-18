import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    example: 4,
    description: 'The review rating (1-5)',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    example: 'Updated comment about the restaurant',
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
