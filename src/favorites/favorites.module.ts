import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../common/services/cache.service';
import { LoggingService } from '../common/services/logging.service';
import { Favorite } from '../entities/favorite.entity';
import { Restaurant } from '../entities/restaurant.entity';

import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Restaurant])],
  controllers: [FavoritesController],
  providers: [FavoritesService, LoggingService, CacheService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
