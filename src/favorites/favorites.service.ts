import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { Restaurant } from '../entities/restaurant.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async addToFavorites(
    userId: number,
    restaurantId: number,
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

    return await this.favoritesRepository.save(favorite);
  }

  async removeFromFavorites(
    userId: number,
    restaurantId: number,
  ): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });
    if (!favorite) {
      throw new NotFoundException('Restaurant not found in favorites');
    }

    await this.favoritesRepository.remove(favorite);
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return await this.favoritesRepository.find({
      where: { user_id: userId },
      relations: ['restaurant'],
      order: { created_at: 'DESC' },
    });
  }
}
