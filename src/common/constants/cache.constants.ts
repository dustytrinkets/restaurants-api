export const CACHE_KEYS = {
  RESTAURANTS: 'restaurants',
  RESTAURANT: 'restaurant',
  RESTAURANT_REVIEWS: 'restaurant-reviews',
  ADMIN_STATS: 'admin-stats',
  REVIEWS: 'reviews',
  REVIEW: 'review',
  FAVORITES: 'favorites',
  FAVORITE: 'favorite',
  USERS: 'users',
  USER: 'user',
} as const;

export const CACHE_TTL = {
  DEFAULT: 300,
  SHORT: 60,
  LONG: 600,
  VERY_LONG: 3600,
} as const;
