import { Restaurant } from '../../entities/restaurant.entity';

import { mapResultsWithAverageRating } from './rating.helper';

describe('RatingHelper', () => {
  describe('mapResultsWithAverageRating', () => {
    it('should map entities with average rating from raw results', () => {
      const mockRestaurants: Restaurant[] = [
        {
          id: 1,
          name: 'Test Restaurant 1',
          neighborhood: 'Manhattan',
          photograph: 'photo1.jpg',
          address: '123 Main St',
          lat: 40.7128,
          lng: -74.006,
          image: 'image1.jpg',
          cuisine_type: 'Italian',
        } as Restaurant,
        {
          id: 2,
          name: 'Test Restaurant 2',
          neighborhood: 'Brooklyn',
          photograph: 'photo2.jpg',
          address: '456 Oak Ave',
          lat: 40.6782,
          lng: -73.9442,
          image: 'image2.jpg',
          cuisine_type: 'Mexican',
        } as Restaurant,
      ];

      const mockRawResults = [
        { averageRating: '4.5' },
        { averageRating: '3.2' },
      ];

      const result = mapResultsWithAverageRating(
        mockRestaurants,
        mockRawResults,
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockRestaurants[0],
        averageRating: 4.5,
      });
      expect(result[1]).toEqual({
        ...mockRestaurants[1],
        averageRating: 3.2,
      });
    });

    it('should handle empty arrays', () => {
      const result = mapResultsWithAverageRating([], []);

      expect(result).toEqual([]);
    });
  });
});
