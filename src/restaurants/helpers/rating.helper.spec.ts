import { Restaurant } from '../../entities/restaurant.entity';
import {
  calculateAverageRatings,
  filterAndSortByRating,
} from './rating.helper';

describe.only('RatingHelper', () => {
  const mockRestaurant: Restaurant = {
    id: 1,
    name: 'Test Restaurant',
    neighborhood: 'Manhattan',
    photograph: '',
    address: '123 Main St',
    lat: 40.7128,
    lng: -74.006,
    image: '',
    cuisine_type: 'Italian',
    reviews: [
      {
        id: 1,
        restaurant_id: 1,
        user_id: 1,
        rating: 4.5,
        comments: 'Great!',
        date: new Date('2025-01-01'),
        created_at: new Date(),
      },
      {
        id: 2,
        restaurant_id: 1,
        user_id: 2,
        rating: 3.5,
        comments: 'Good',
        date: new Date('2025-01-02'),
        created_at: new Date(),
      },
    ],
  };

  const mockRestaurants: Restaurant[] = [
    {
      ...mockRestaurant,
      id: 1,
      reviews: [
        {
          id: 1,
          restaurant_id: 1,
          user_id: 1,
          rating: 4.0,
          comments: 'Good',
          date: new Date('2025-01-01'),
          created_at: new Date(),
        },
      ],
    },
    {
      ...mockRestaurant,
      id: 2,
      reviews: [
        {
          id: 2,
          restaurant_id: 2,
          user_id: 1,
          rating: 5.0,
          comments: 'Excellent',
          date: new Date('2025-01-01'),
          created_at: new Date(),
        },
        {
          id: 3,
          restaurant_id: 2,
          user_id: 2,
          rating: 4.0,
          comments: 'Very good',
          date: new Date('2025-01-02'),
          created_at: new Date(),
        },
      ],
    },
    {
      ...mockRestaurant,
      id: 3,
      reviews: [],
    },
  ];

  describe('calculateAverageRatings', () => {
    it('should calculate averages for multiple restaurants', () => {
      const result = calculateAverageRatings(mockRestaurants);

      expect(result).toHaveLength(3);
      expect(result[0].averageRating).toBe(4.0);
      expect(result[1].averageRating).toBe(4.5);
      expect(result[2].averageRating).toBe(0);
    });
  });

  describe('filterAndSortByRating', () => {
    it('should filter and sort by rating', () => {
      const restaurantsWithRatings = calculateAverageRatings(mockRestaurants);
      const result = filterAndSortByRating(restaurantsWithRatings, {
        rating: 4.0,
        sort: 'rating',
        order: 'desc',
      });

      expect(result).toHaveLength(2);
      expect(result[0].averageRating).toBe(4.5);
    });

    it('should only filter when no rating sort requested', () => {
      const restaurantsWithRatings = calculateAverageRatings(mockRestaurants);
      const result = filterAndSortByRating(restaurantsWithRatings, {
        rating: 4.5,
        sort: 'cuisine_type',
        order: 'asc',
      });

      expect(result).toHaveLength(1);
      expect(result[0].averageRating).toBe(4.5);
    });
  });
});
