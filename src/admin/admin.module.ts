import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Restaurant, Review])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
