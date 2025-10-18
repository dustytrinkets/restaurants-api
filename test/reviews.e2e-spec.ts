import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import request from 'supertest';
import { Express } from 'express';
import { AppModule } from '../src/app.module';
import { Restaurant } from '../src/entities/restaurant.entity';
import { Review } from '../src/entities/review.entity';
import { User } from '../src/entities/user.entity';
import { UserRole } from '../src/common/enums/user-role.enum';
import { AuthResponseDto } from '../src/auth/dto/auth-response.dto';

describe('Reviews (e2e)', () => {
  let app: INestApplication;
  let restaurantRepository: Repository<Restaurant>;
  let reviewRepository: Repository<Review>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Restaurant, Review, User],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    restaurantRepository = moduleFixture.get('RestaurantRepository');
    reviewRepository = moduleFixture.get('ReviewRepository');
    userRepository = moduleFixture.get('UserRepository');

    await app.init();
  });

  beforeEach(async () => {
    await reviewRepository.clear();
    await restaurantRepository.clear();
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /restaurants/:id/reviews', () => {
    it('should create a review for a restaurant (user)', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      const userData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const userResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userToken = (userResponse.body as AuthResponseDto).access_token;

      const reviewData = {
        rating: 4,
        comments: 'Great food and service!',
        date: '2025-01-15',
      };

      const response = await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      const body = response.body as Review;
      expect(body).toHaveProperty('id');
      expect(body.rating).toBe(4);
      expect(body.comments).toBe('Great food and service!');
      expect(body.restaurant_id).toBe(restaurant.id);
    });

    it('should create a review for a restaurant (admin)', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

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

      const reviewData = {
        rating: 5,
        comments: 'Excellent restaurant!',
        date: '2025-01-15',
      };

      const response = await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reviewData)
        .expect(201);

      const body = response.body as Review;
      expect(body).toHaveProperty('id');
      expect(body.rating).toBe(5);
      expect(body.comments).toBe('Excellent restaurant!');
      expect(body.restaurant_id).toBe(restaurant.id);
    });

    it('should fail without authentication', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      const reviewData = {
        rating: 4,
        comments: 'Great food!',
      };

      await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .send(reviewData)
        .expect(401);
    });

    it('should fail for non-existent restaurant', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const userResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userToken = (userResponse.body as AuthResponseDto).access_token;

      const reviewData = {
        rating: 4,
        comments: 'Great food!',
      };

      await request(app.getHttpServer() as Express)
        .post('/restaurants/999/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(404);
    });

    it('should validate rating range', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      const userData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const userResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userToken = (userResponse.body as AuthResponseDto).access_token;

      const reviewData = {
        rating: 6,
        comments: 'Great food!',
      };

      await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);
    });
  });

  describe('GET /me/reviews', () => {
    it('should get user reviews', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      const userData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const userResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userToken = (userResponse.body as AuthResponseDto).access_token;

      const reviewData = {
        rating: 4,
        comments: 'Great food!',
        date: '2025-01-15',
      };

      await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      const response = await request(app.getHttpServer() as Express)
        .get('/me/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = response.body as Review[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0].rating).toBe(4);
    });

    it('should work for admin users', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

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

      const reviewData = {
        rating: 4,
        comments: 'Great food!',
        date: '2025-01-15',
      };

      await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reviewData)
        .expect(201);

      const response = await request(app.getHttpServer() as Express)
        .get('/me/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as Review[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
    });
  });

  describe('PUT /me/reviews/:id', () => {
    it('should update user review', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      const userData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const userResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userToken = (userResponse.body as AuthResponseDto).access_token;

      const reviewData = {
        rating: 4,
        comments: 'Great food!',
        date: '2025-01-15',
      };

      const createResponse = await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      const reviewId = (createResponse.body as Review).id;

      const updateData = {
        rating: 5,
        comments: 'Excellent food!',
      };

      const response = await request(app.getHttpServer() as Express)
        .put(`/me/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      const body = response.body as Review;
      expect(body.rating).toBe(5);
      expect(body.comments).toBe('Excellent food!');
    });

    it('should fail to access other user reviews', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      const user1Data = {
        email: 'user1@example.com',
        password: 'password123',
        name: 'User One',
      };

      const user1Response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(user1Data)
        .expect(201);

      const user1Token = (user1Response.body as AuthResponseDto).access_token;

      const reviewData = {
        rating: 4,
        comments: 'Great food!',
        date: '2025-01-15',
      };

      const createResponse = await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(reviewData)
        .expect(201);

      const reviewId = (createResponse.body as Review).id;

      const user2Data = {
        email: 'user2@example.com',
        password: 'password123',
        name: 'User Two',
      };

      const user2Response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(user2Data)
        .expect(201);

      const user2Token = (user2Response.body as AuthResponseDto).access_token;

      await request(app.getHttpServer() as Express)
        .put(`/me/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ rating: 5.0 })
        .expect(404);
    });
  });

  describe('DELETE /me/reviews/:id', () => {
    it('should delete user review', async () => {
      const restaurant = await restaurantRepository.save({
        name: 'Test Restaurant',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      const userData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const userResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userToken = (userResponse.body as AuthResponseDto).access_token;

      const reviewData = {
        rating: 4,
        comments: 'Great food!',
        date: '2025-01-15',
      };

      const createResponse = await request(app.getHttpServer() as Express)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      const reviewId = (createResponse.body as Review).id;

      const response = await request(app.getHttpServer() as Express)
        .delete(`/me/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = response.body as { message: string };
      expect(body.message).toBe('Review deleted successfully');
    });
  });
});
