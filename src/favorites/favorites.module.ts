import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { Favorite } from '../entities/favorite.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { LoggingService } from '../common/services/logging.service';
import { CacheService } from '../common/services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Restaurant])],
  controllers: [FavoritesController],
  providers: [FavoritesService, LoggingService, CacheService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
