import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Restaurant } from './restaurant.entity';
import { User } from './user.entity';

@Entity('favorites')
export class Favorite {
  @ApiProperty({
    example: 1,
    description: 'The user ID who favorited this restaurant',
  })
  @PrimaryColumn({ name: 'user_id' })
  user_id: number;

  @ApiProperty({
    example: 1,
    description: 'The restaurant ID that was favorited',
  })
  @PrimaryColumn({ name: 'restaurant_id' })
  restaurant_id: number;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: Restaurant;
}
