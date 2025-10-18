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
import { StatsDto } from '../src/admin/dto/stats.dto';
import { CacheService } from '../src/common/services/cache.service';

describe('Admin (e2e)', () => {
  let app: INestApplication;
  let restaurantRepository: Repository<Restaurant>;
  let reviewRepository: Repository<Review>;
  let userRepository: Repository<User>;
  let cacheService: CacheService;

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
    cacheService = moduleFixture.get<CacheService>(CacheService);

    await app.init();
  });

  beforeEach(async () => {
    await reviewRepository.clear();
    await restaurantRepository.clear();
    await userRepository.clear();

    await cacheService.del('admin-stats');
    await cacheService.del('restaurants');
    await cacheService.del('restaurant-reviews');

    const restaurants = await restaurantRepository.save([
      {
        name: 'Restaurant One',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      },
      {
        name: 'Restaurant Two',
        neighborhood: 'Brooklyn',
        cuisine_type: 'Mexican',
        address: '456 Oak Ave',
        lat: 40.6782,
        lng: -73.9442,
      },
      {
        name: 'Restaurant Three',
        neighborhood: 'Queens',
        cuisine_type: 'Asian',
        address: '789 Pine St',
        lat: 40.7282,
        lng: -73.7949,
      },
    ]);

    await reviewRepository.save([
      {
        restaurant_id: restaurants[0].id,
        user_id: 1,
        rating: 4.5,
        comments: 'Great food!',
        date: '2025-01-01',
      },
      {
        restaurant_id: restaurants[0].id,
        user_id: 2,
        rating: 3.5,
        comments: 'Good service',
        date: '2025-01-02',
      },
      {
        restaurant_id: restaurants[1].id,
        user_id: 1,
        rating: 5.0,
        comments: 'Excellent',
        date: '2025-01-03',
      },
      {
        restaurant_id: restaurants[1].id,
        user_id: 2,
        rating: 4.0,
        comments: 'Very good',
        date: '2025-01-04',
      },
      {
        restaurant_id: restaurants[2].id,
        user_id: 3,
        rating: 4.5,
        comments: 'Amazing',
        date: '2025-01-05',
      },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /admin/stats', () => {
    it('should return platform statistics for admin', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };

      const adminResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(adminData)
        .expect(201);

      const adminToken = (adminResponse.body as AuthResponseDto).access_token;

      await userRepository.save([
        {
          email: 'user1@example.com',
          password: 'password123',
          name: 'User One',
          role: UserRole.USER,
          created_at: new Date().toISOString(),
        },
        {
          email: 'user2@example.com',
          password: 'password123',
          name: 'User Two',
          role: UserRole.USER,
          created_at: new Date().toISOString(),
        },
        {
          email: 'user3@example.com',
          password: 'password123',
          name: 'User Three',
          role: UserRole.USER,
          created_at: new Date().toISOString(),
        },
      ]);

      return request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as StatsDto;
          expect(body).toHaveProperty('totalUsers', 4);
          expect(body).toHaveProperty('totalRestaurants', 3);
          expect(body).toHaveProperty('totalReviews', 5);
        });
    });

    it('should fail without authentication', async () => {
      return request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      return request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should fail with regular user token', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Regular User',
      };

      const userResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userToken = (userResponse.body as AuthResponseDto).access_token;

      return request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return zero counts when no data exists', async () => {
      await reviewRepository.clear();
      await restaurantRepository.clear();
      await userRepository.clear();

      const adminData = {
        email: 'admin2@example.com',
        password: 'password123',
        name: 'Admin User 2',
        role: UserRole.ADMIN,
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(adminData)
        .expect(201);

      const adminToken2 = (response.body as AuthResponseDto).access_token;

      return request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken2}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as StatsDto;
          expect(body).toHaveProperty('totalUsers', 1);
          expect(body).toHaveProperty('totalRestaurants', 0);
          expect(body).toHaveProperty('totalReviews', 0);
        });
    });
  });

  describe('Data integrity tests', () => {
    it('should reflect real-time data changes', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };

      const adminResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(adminData)
        .expect(201);

      const adminToken = (adminResponse.body as AuthResponseDto).access_token;

      const initialResponse = await request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const initialStats = initialResponse.body as StatsDto;
      const initialUserCount = initialStats.totalUsers;

      await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          role: UserRole.USER,
        })
        .expect(201);

      const updatedResponse = await request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const updatedStats = updatedResponse.body as StatsDto;
      expect(updatedStats.totalUsers).toBe(initialUserCount + 1);
    });

    it('should handle deleted data correctly', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };

      const adminResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(adminData)
        .expect(201);

      const adminToken = (adminResponse.body as AuthResponseDto).access_token;

      const initialResponse = await request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const initialStats = initialResponse.body as StatsDto;
      const initialRestaurantCount = initialStats.totalRestaurants;

      const restaurants = await restaurantRepository.find();
      if (restaurants.length > 0) {
        const restaurantToDelete = restaurants[0];

        await request(app.getHttpServer() as Express)
          .delete(`/restaurants/${restaurantToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
      }

      const updatedResponse = await request(app.getHttpServer() as Express)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const updatedStats = updatedResponse.body as StatsDto;
      expect(updatedStats.totalRestaurants).toBe(initialRestaurantCount - 1);
    });
  });
});
