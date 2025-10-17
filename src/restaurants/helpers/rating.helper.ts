import { Restaurant } from '../../entities/restaurant.entity';

function _calculateAverageRating(restaurant: Restaurant): number {
  if (!restaurant.reviews || restaurant.reviews.length === 0) {
    return 0;
  }

  const totalRating = restaurant.reviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  );
  return totalRating / restaurant.reviews.length;
}

export function calculateAverageRatings(
  restaurants: Restaurant[],
): (Restaurant & { averageRating: number })[] {
  return restaurants.map((restaurant) => ({
    ...restaurant,
    averageRating: _calculateAverageRating(restaurant),
  }));
}

function _filterByMinRating(
  restaurants: (Restaurant & { averageRating: number })[],
  minRating: number,
): (Restaurant & { averageRating: number })[] {
  return restaurants.filter(
    (restaurant) => restaurant.averageRating >= minRating,
  );
}

function _sortByRating(
  restaurants: (Restaurant & { averageRating: number })[],
  order: 'asc' | 'desc' = 'desc',
): (Restaurant & { averageRating: number })[] {
  return restaurants.sort((a, b) => {
    const isDescending = order.toLowerCase() === 'desc';
    return isDescending
      ? b.averageRating - a.averageRating
      : a.averageRating - b.averageRating;
  });
}

export function filterAndSortByRating(
  restaurants: (Restaurant & { averageRating: number })[],
  filters: { rating?: number; sort: string; order: string },
): (Restaurant & { averageRating: number })[] {
  let filteredData = restaurants;

  if (filters.rating !== undefined) {
    filteredData = _filterByMinRating(filteredData, filters.rating);
  }

  if (filters.sort === 'rating') {
    filteredData = _sortByRating(filteredData, filters.order as 'asc' | 'desc');
  }

  return filteredData;
}
