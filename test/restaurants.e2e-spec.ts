import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { Restaurant } from '../src/entities/restaurant.entity';
import { Review } from '../src/entities/review.entity';
import { User } from '../src/entities/user.entity';
import { Express } from 'express';
import { UserRole } from '../src/common/enums/user-role.enum';
import { AuthResponseDto } from '../src/auth/dto/auth-response.dto';
import { TopRestaurantsStatsDto } from '../src/admin/dto/restaurant-stats.dto';
import { RestaurantWithRatingDto } from '../src/restaurants/dto/restaurant-with-rating.dto';
import { RestaurantsListResponse } from '../src/restaurants/interfaces/restaurants-list-response.interface';

describe('Restaurants (e2e)', () => {
  let app: INestApplication;
  let restaurantRepository: Repository<Restaurant>;
  let reviewRepository: Repository<Review>;
  let userRepository: Repository<User>;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    restaurantRepository = moduleFixture.get('RestaurantRepository');
    reviewRepository = moduleFixture.get('ReviewRepository');
    userRepository = moduleFixture.get('UserRepository');

    await app.init();
  });

  beforeEach(async () => {
    await reviewRepository.clear();
    await restaurantRepository.clear();
    await userRepository.clear();

    const adminData = {
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
      role: UserRole.ADMIN,
    };

    const response = await request(app.getHttpServer() as Express)
      .post('/auth/register')
      .send(adminData)
      .expect(201);

    adminToken = (response.body as AuthResponseDto).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /restaurants', () => {
    it('should create a restaurant', async () => {
      const createRestaurantDto = {
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      };

      return request(app.getHttpServer() as Express)
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createRestaurantDto)
        .expect(201)
        .expect((res) => {
          const body = res.body as RestaurantWithRatingDto;
          expect(body.name).toBe(createRestaurantDto.name);
          expect(body.neighborhood).toBe(createRestaurantDto.neighborhood);
          expect(body.cuisine_type).toBe(createRestaurantDto.cuisine_type);
          expect(body.id).toBeDefined();
        });
    });

    it('should fail without admin token', async () => {
      const createRestaurantDto = {
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      };

      return request(app.getHttpServer() as Express)
        .post('/restaurants')
        .send(createRestaurantDto)
        .expect(401);
    });

    it('should fail with invalid data', async () => {
      const invalidDto = {
        name: '',
        lat: 91,
        lng: 181,
      };

      return request(app.getHttpServer() as Express)
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail without required fields', async () => {
      const incompleteDto = {
        neighborhood: 'Manhattan',
      };

      return request(app.getHttpServer() as Express)
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteDto)
        .expect(400);
    });
  });

  describe('GET /restaurants', () => {
    beforeEach(async () => {
      const restaurants = [
        {
          name: 'Italian Place',
          neighborhood: 'Manhattan',
          cuisine_type: 'Italian',
          address: '123 Main St',
          lat: 40.7128,
          lng: -74.006,
        },
        {
          name: 'Mexican Joint',
          neighborhood: 'Brooklyn',
          cuisine_type: 'Mexican',
          address: '456 Oak Ave',
          lat: 40.6782,
          lng: -73.9442,
        },
        {
          name: 'Asian Fusion',
          neighborhood: 'Queens',
          cuisine_type: 'Asian',
          address: '789 Pine St',
          lat: 40.7282,
          lng: -73.7949,
        },
      ];

      for (const restaurant of restaurants) {
        await restaurantRepository.save(restaurant);
      }

      const savedRestaurants = await restaurantRepository.find();
      await reviewRepository.save([
        {
          restaurant_id: savedRestaurants[0].id,
          user_id: 1,
          rating: 4.0,
          comments: 'Good food',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[0].id,
          user_id: 2,
          rating: 4.0,
          comments: 'Nice place',
          date: '2025-01-02',
        },
        {
          restaurant_id: savedRestaurants[1].id,
          user_id: 1,
          rating: 5.0,
          comments: 'Excellent',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[1].id,
          user_id: 2,
          rating: 4.0,
          comments: 'Very good',
          date: '2025-01-02',
        },
      ]);
    });

    it('should return all restaurants', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(3);
          expect(body.total).toBe(3);
          expect(body.page).toBe(1);
          expect(body.limit).toBe(10);
          expect(body.totalPages).toBe(1);
        });
    });

    it('should return restaurants with average ratings', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data[0].averageRating).toBe(0);
          expect(body.data[1].averageRating).toBe(4);
          expect(body.data[2].averageRating).toBe(4.5);
        });
    });

    it('should filter by cuisine', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?cuisine=Italian')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].cuisine_type).toBe('Italian');
        });
    });

    it('should filter by neighborhood', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?neighborhood=Brooklyn')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].neighborhood).toBe('Brooklyn');
        });
    });

    it('should filter by rating', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?rating=4.5')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].averageRating).toBeGreaterThanOrEqual(4.5);
        });
    });

    it('should sort by cuisine_type', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?sort=cuisine_type&order=asc')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data[0].cuisine_type).toBe('Asian');
          expect(body.data[1].cuisine_type).toBe('Italian');
          expect(body.data[2].cuisine_type).toBe('Mexican');
        });
    });

    it('should sort by rating', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?sort=rating&order=desc')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data[0].averageRating).toBe(4.5);
          expect(body.data[1].averageRating).toBe(4.0);
          expect(body.data[2].averageRating).toBe(0);
        });
    });

    it('should handle pagination', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?page=1&limit=2')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(2);
          expect(body.page).toBe(1);
          expect(body.limit).toBe(2);
          expect(body.total).toBe(3);
          expect(body.totalPages).toBe(2);
        });
    });

    it('should combine filters', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?cuisine=Italian&neighborhood=Manhattan&rating=4.0')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].cuisine_type).toBe('Italian');
          expect(body.data[0].neighborhood).toBe('Manhattan');
          expect(body.data[0].averageRating).toBe(4.0);
        });
    });

    it('should fail with invalid query parameters', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?page=0')
        .expect(400);
    });

    it('should fail with invalid rating', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?rating=6.0')
        .expect(400);
    });

    it('should fail with invalid sort field', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?sort=invalid_field')
        .expect(400);
    });
  });

  describe('GET /restaurants/:id', () => {
    it('should return a restaurant by id', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      await reviewRepository.save([
        {
          restaurant_id: restaurant.id,
          user_id: 1,
          rating: 4.5,
          comments: 'Great food!',
          date: '2025-01-01',
        },
        {
          restaurant_id: restaurant.id,
          user_id: 2,
          rating: 3.5,
          comments: 'Good service',
          date: '2025-01-02',
        },
      ]);
      return request(app.getHttpServer() as Express)
        .get(`/restaurants/${restaurant.id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantWithRatingDto;
          expect(body.id).toBe(restaurant.id);
          expect(body.name).toBe(restaurant.name);
          expect(body.neighborhood).toBe(restaurant.neighborhood);
          expect(body.cuisine_type).toBe(restaurant.cuisine_type);
          expect(body.address).toBe(restaurant.address);
          expect(body.lat).toBe(restaurant.lat);
          expect(body.lng).toBe(restaurant.lng);
          expect(body.averageRating).toBe(4.0);
        });
    });

    it('should return 404 for non-existent restaurant', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants/999')
        .expect(404)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe('Restaurant with ID 999 not found');
        });
    });
  });

  describe('GET /restaurants/:id/reviews', () => {
    it('should return reviews for a restaurant', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'No Reviews Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      await reviewRepository.save([
        {
          restaurant_id: restaurant.id,
          user_id: 1,
          rating: 4.5,
          comments: 'Great food!',
          date: '2025-01-01',
        },
        {
          restaurant_id: restaurant.id,
          user_id: 2,
          rating: 3.5,
          comments: 'Good service',
          date: '2025-01-02',
        },
      ]);

      return request(app.getHttpServer() as Express)
        .get(`/restaurants/${restaurant.id}/reviews`)
        .expect(200)
        .expect((res) => {
          const body = res.body as Review[];
          expect(body).toHaveLength(2);
          expect(body[0].rating).toBe(4.5);
          expect(body[0].comments).toBe('Great food!');
          expect(body[1].rating).toBe(3.5);
          expect(body[1].comments).toBe('Good service');
        });
    });

    it('should return empty array for restaurant with no reviews', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'No Reviews Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      return request(app.getHttpServer() as Express)
        .get(`/restaurants/${restaurant.id}/reviews`)
        .expect(200)
        .expect((res) => {
          const body = res.body as Review[];
          expect(body).toHaveLength(0);
        });
    });

    it('should return 404 for non-existent restaurant reviews', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants/999/reviews')
        .expect(404)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe('Restaurant with ID 999 not found');
        });
    });
  });

  describe('PATCH /restaurants/:id', () => {
    let restaurant: Restaurant;

    beforeEach(async () => {
      restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });
    });

    it('should update a restaurant', async () => {
      const updateDto = {
        name: 'Updated Restaurant',
        cuisine_type: 'French',
      };

      return request(app.getHttpServer() as Express)
        .patch(`/restaurants/${restaurant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantWithRatingDto;
          expect(body.name).toBe(updateDto.name);
          expect(body.cuisine_type).toBe(updateDto.cuisine_type);
          expect(body.id).toBe(restaurant.id);
        });
    });

    it('should fail with invalid data', async () => {
      const invalidDto = {
        lat: 91,
      };

      return request(app.getHttpServer() as Express)
        .patch(`/restaurants/${restaurant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 404 for non-existent restaurant', async () => {
      return request(app.getHttpServer() as Express)
        .patch('/restaurants/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' })
        .expect(404)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe('Restaurant with ID 999 not found');
        });
    });
  });

  describe('DELETE /restaurants/:id', () => {
    let restaurant: Restaurant;

    beforeEach(async () => {
      restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });
    });

    it('should delete a restaurant', async () => {
      return request(app.getHttpServer() as Express)
        .delete(`/restaurants/${restaurant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should return 404 for non-existent restaurant', async () => {
      return request(app.getHttpServer() as Express)
        .delete('/restaurants/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe('Restaurant with ID 999 not found');
        });
    });
  });

  describe('GET /admin/restaurants/top', () => {
    beforeEach(async () => {
      const restaurants = [
        {
          name: 'Top Rated Restaurant',
          neighborhood: 'Manhattan',
          cuisine_type: 'Italian',
          address: '123 Main St',
          lat: 40.7128,
          lng: -74.006,
        },
        {
          name: 'Second Best Restaurant',
          neighborhood: 'Brooklyn',
          cuisine_type: 'Mexican',
          address: '456 Oak Ave',
          lat: 40.6782,
          lng: -73.9442,
        },
        {
          name: 'Third Best Restaurant',
          neighborhood: 'Queens',
          cuisine_type: 'Asian',
          address: '789 Pine St',
          lat: 40.7282,
          lng: -73.7949,
        },
        {
          name: 'Most Reviewed Restaurant',
          neighborhood: 'Manhattan',
          cuisine_type: 'American',
          address: '321 Broadway',
          lat: 40.7589,
          lng: -73.9851,
        },
        {
          name: 'Second Most Reviewed',
          neighborhood: 'Brooklyn',
          cuisine_type: 'French',
          address: '654 Park Ave',
          lat: 40.7505,
          lng: -73.9934,
        },
        {
          name: 'Third Most Reviewed',
          neighborhood: 'Queens',
          cuisine_type: 'Indian',
          address: '987 5th Ave',
          lat: 40.7614,
          lng: -73.9776,
        },
      ];

      const savedRestaurants: Restaurant[] = [];
      for (const restaurant of restaurants) {
        savedRestaurants.push(await restaurantRepository.save(restaurant));
      }

      await reviewRepository.save([
        {
          restaurant_id: savedRestaurants[0].id,
          user_id: 1,
          rating: 5.0,
          comments: 'Excellent!',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[0].id,
          user_id: 2,
          rating: 4.8,
          comments: 'Amazing food',
          date: '2025-01-02',
        },
        {
          restaurant_id: savedRestaurants[1].id,
          user_id: 1,
          rating: 4.5,
          comments: 'Very good',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[1].id,
          user_id: 2,
          rating: 4.2,
          comments: 'Good service',
          date: '2025-01-02',
        },
        {
          restaurant_id: savedRestaurants[2].id,
          user_id: 1,
          rating: 4.0,
          comments: 'Nice place',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[2].id,
          user_id: 2,
          rating: 3.8,
          comments: 'Decent food',
          date: '2025-01-02',
        },
        {
          restaurant_id: savedRestaurants[3].id,
          user_id: 1,
          rating: 4.0,
          comments: 'Good',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[3].id,
          user_id: 2,
          rating: 3.5,
          comments: 'Okay',
          date: '2025-01-02',
        },
        {
          restaurant_id: savedRestaurants[3].id,
          user_id: 3,
          rating: 4.2,
          comments: 'Nice',
          date: '2025-01-03',
        },
        {
          restaurant_id: savedRestaurants[3].id,
          user_id: 4,
          rating: 3.8,
          comments: 'Average',
          date: '2025-01-04',
        },
        {
          restaurant_id: savedRestaurants[4].id,
          user_id: 1,
          rating: 3.5,
          comments: 'Decent',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[4].id,
          user_id: 2,
          rating: 3.0,
          comments: 'Okay',
          date: '2025-01-02',
        },
        {
          restaurant_id: savedRestaurants[4].id,
          user_id: 3,
          rating: 3.8,
          comments: 'Good',
          date: '2025-01-03',
        },
        {
          restaurant_id: savedRestaurants[5].id,
          user_id: 1,
          rating: 3.2,
          comments: 'Average',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[5].id,
          user_id: 2,
          rating: 3.5,
          comments: 'Decent',
          date: '2025-01-02',
        },
      ]);
    });

    it('should return top 3 rated restaurants', () => {
      return request(app.getHttpServer() as Express)
        .get('/admin/restaurants/top')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as TopRestaurantsStatsDto;
          expect(body.topRated).toHaveLength(3);
          expect(body.mostReviewed).toHaveLength(3);

          expect(Number(body.topRated[0].averageRating)).toBeGreaterThanOrEqual(
            Number(body.topRated[1].averageRating),
          );
          expect(Number(body.topRated[1].averageRating)).toBeGreaterThanOrEqual(
            Number(body.topRated[2].averageRating),
          );

          expect(
            Number(body.mostReviewed[0].reviewCount),
          ).toBeGreaterThanOrEqual(Number(body.mostReviewed[1].reviewCount));
          expect(
            Number(body.mostReviewed[1].reviewCount),
          ).toBeGreaterThanOrEqual(Number(body.mostReviewed[2].reviewCount));
        });
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer() as Express)
        .get('/admin/restaurants/top')
        .expect(401);
    });

    it('should fail with regular user token', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Regular User',
        role: UserRole.USER,
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userToken = (response.body as AuthResponseDto).access_token;

      return request(app.getHttpServer() as Express)
        .get('/admin/restaurants/top')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return exactly 3 restaurants for each category', () => {
      return request(app.getHttpServer() as Express)
        .get('/admin/restaurants/top')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as TopRestaurantsStatsDto;
          expect(body.topRated).toHaveLength(3);
          expect(body.mostReviewed).toHaveLength(3);
        });
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(async () => {
      const restaurants = [
        {
          name: 'High Rated Italian',
          neighborhood: 'Manhattan',
          cuisine_type: 'Italian',
          address: '123 Main St',
          lat: 40.7128,
          lng: -74.006,
        },
        {
          name: 'Low Rated Mexican',
          neighborhood: 'Brooklyn',
          cuisine_type: 'Mexican',
          address: '456 Oak Ave',
          lat: 40.6782,
          lng: -73.9442,
        },
        {
          name: 'No Reviews Asian',
          neighborhood: 'Queens',
          cuisine_type: 'Asian',
          address: '789 Pine St',
          lat: 40.7282,
          lng: -73.7949,
        },
        {
          name: 'First Mexican',
          neighborhood: 'Manhattan',
          cuisine_type: 'Mexican',
          address: '123 Main St',
          lat: 40.7128,
          lng: -74.006,
        },
        {
          name: 'Second Mexican',
          neighborhood: 'Manhattan',
          cuisine_type: 'Mexican',
          address: '456 Oak Ave',
          lat: 40.6782,
          lng: -73.9442,
        },
      ];

      const savedRestaurants: Restaurant[] = [];
      for (const restaurant of restaurants) {
        savedRestaurants.push(await restaurantRepository.save(restaurant));
      }

      await reviewRepository.save([
        {
          restaurant_id: savedRestaurants[0].id,
          user_id: 1,
          rating: 5.0,
          comments: 'Excellent',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[0].id,
          user_id: 2,
          rating: 4.5,
          comments: 'Very good',
          date: '2025-01-02',
        },
        {
          restaurant_id: savedRestaurants[1].id,
          user_id: 1,
          rating: 2.0,
          comments: 'Poor',
          date: '2025-01-01',
        },
        {
          restaurant_id: savedRestaurants[1].id,
          user_id: 2,
          rating: 2.5,
          comments: 'Not great',
          date: '2025-01-02',
        },
      ]);
    });

    it('should handle complex filtering and sorting', () => {
      return request(app.getHttpServer() as Express)
        .get(
          '/restaurants?cuisine=Italian&rating=4.0&sort=rating&order=desc&page=1&limit=10',
        )
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].cuisine_type).toBe('Italian');
          expect(body.data[0].averageRating).toBe(4.75);
        });
    });

    it('should handle pagination', () => {
      return request(app.getHttpServer() as Express)
        .get(
          '/restaurants?cuisine=Mexican&neighborhood=Manhattan&page=2&limit=1',
        )
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].cuisine_type).toBe('Mexican');
          expect(body.data[0].name).toBe('Second Mexican');
        });
    });

    it('should handle empty results', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?cuisine=French')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(0);
          expect(body.total).toBe(0);
        });
    });

    it('should handle restaurants with no reviews', () => {
      return request(app.getHttpServer() as Express)
        .get('/restaurants?cuisine=Asian')
        .expect(200)
        .expect((res) => {
          const body = res.body as RestaurantsListResponse;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].averageRating).toBe(0);
          expect(body.data[0].name).toBe('No Reviews Asian');
        });
    });
  });
});
