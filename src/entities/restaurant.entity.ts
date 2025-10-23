import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { Review } from './review.entity';

@Entity('restaurants')
export class Restaurant {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the restaurant',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Mission Chinese Food',
    description: 'The name of the restaurant',
  })
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({
    example: 'Manhattan',
    description: 'The neighborhood where the restaurant is located',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  neighborhood: string;

  @ApiProperty({
    example: '1.jpg',
    description:
      'The photograph file name (relative to the id of the restaurant',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  photograph: string;

  @ApiProperty({
    example: '171 E Broadway, New York, NY 10002',
    description: 'The address of the restaurant',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({
    example: 40.713829,
    description: 'Latitude coordinate',
    required: false,
  })
  @Column({ type: 'real', nullable: true })
  lat: number;

  @ApiProperty({
    example: -73.989667,
    description: 'Longitude coordinate',
    required: false,
  })
  @Column({ type: 'real', nullable: true })
  lng: number;

  @ApiProperty({
    example: 'restaurant-image.jpg',
    description: 'The image filename',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  image: string;

  @ApiProperty({
    example: 'Asian',
    description: 'The type of cuisine',
    required: false,
  })
  @Column({ type: 'text', nullable: true, name: 'cuisine_type' })
  cuisine_type: string;

  @OneToMany(() => Review, (review) => review.restaurant)
  reviews?: Review[];
}
