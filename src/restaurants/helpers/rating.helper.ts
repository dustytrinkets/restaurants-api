import { SelectQueryBuilder } from 'typeorm';
import { Restaurant } from '../../entities/restaurant.entity';
import { RestaurantWithRating } from '../interfaces/restaurant-with-rating.interface';

export function addAverageRatingToQuery(
  queryBuilder: SelectQueryBuilder<Restaurant>,
): SelectQueryBuilder<Restaurant> {
  return queryBuilder
    .leftJoin('restaurant.reviews', 'review')
    .addSelect('COALESCE(AVG(review.rating), 0)', 'averageRating')
    .groupBy('restaurant.id');
}
export function mapResultsWithAverageRating(
  entities: Restaurant[],
  rawResults: any[],
): RestaurantWithRating[] {
  return entities.map((restaurant, index) => ({
    ...restaurant,
    averageRating: parseFloat(
      (rawResults[index] as { averageRating: string }).averageRating,
    ),
  }));
}
