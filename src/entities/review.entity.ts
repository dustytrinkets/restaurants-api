import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from './restaurant.entity';

@Entity('reviews')
export class Review {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the review',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: 'The restaurant ID this review belongs to',
  })
  @Column({ name: 'restaurant_id' })
  restaurant_id: number;

  @ApiProperty({
    example: 1,
    description: 'The user ID who gave this review',
  })
  @Column({ name: 'user_id' })
  user_id: number;

  @ApiProperty({
    example: 4,
    description: 'The review value (1-5)',
  })
  @Column({ type: 'integer', nullable: true })
  rating: number;

  @ApiProperty({
    example: 'Great food and service!',
    description: 'User comment about the restaurant',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  comments: string;

  @ApiProperty({
    example: 'October 26, 2016',
    description: 'Date of the visit to the restaurant',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  date: string;

  @ApiProperty({
    example: '2025-10-17T15:30:00.000Z',
    description: 'Creation timestamp',
  })
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reviews)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: Restaurant;
}
