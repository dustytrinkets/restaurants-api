import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CACHE_KEYS } from '../common/constants/cache.constants';
import { CacheService } from '../common/services/cache.service';
import { LoggingService } from '../common/services/logging.service';
import { Favorite } from '../entities/favorite.entity';
import { Restaurant } from '../entities/restaurant.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    private loggingService: LoggingService,
    private cacheService: CacheService,
  ) {}

  async addToFavorites(
    userId: number,
    restaurantId: number,
    ip?: string,
  ): Promise<Favorite> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    const existingFavorite = await this.favoritesRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });
    if (existingFavorite) {
      throw new ConflictException('Restaurant is already in favorites');
    }

    const favorite = this.favoritesRepository.create({
      user_id: userId,
      restaurant_id: restaurantId,
    });

    const savedFavorite = await this.favoritesRepository.save(favorite);

    await this.cacheService.del(CACHE_KEYS.ADMIN_STATS);

    this.loggingService.logMessage(
      `Favorite added: Restaurant ${restaurantId} by user ${userId} from IP: ${ip || 'unknown'}`,
      'FAVORITE',
    );

    return savedFavorite;
  }

  async removeFromFavorites(
    userId: number,
    restaurantId: number,
    ip?: string,
  ): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });
    if (!favorite) {
      throw new NotFoundException('Restaurant not found in favorites');
    }

    await this.favoritesRepository.remove(favorite);

    await this.cacheService.del(CACHE_KEYS.ADMIN_STATS);

    this.loggingService.logMessage(
      `Favorite removed: Restaurant ${restaurantId} by user ${userId} from IP: ${ip || 'unknown'}`,
      'FAVORITE',
    );
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return await this.favoritesRepository.find({
      where: { user_id: userId },
      relations: ['restaurant'],
      order: { created_at: 'DESC' },
    });
  }
}
