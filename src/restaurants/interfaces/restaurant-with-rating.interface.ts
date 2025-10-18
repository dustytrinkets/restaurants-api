import { Restaurant } from '../../entities/restaurant.entity';

export interface RestaurantWithRating extends Restaurant {
  averageRating: number;
}
