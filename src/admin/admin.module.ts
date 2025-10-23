import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../common/services/cache.service';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Restaurant, Review])],
  controllers: [AdminController],
  providers: [AdminService, CacheService],
})
export class AdminModule {}
