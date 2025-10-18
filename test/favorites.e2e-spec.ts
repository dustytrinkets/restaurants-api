import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import request from 'supertest';
import { Express } from 'express';
import { AppModule } from '../src/app.module';
import { Restaurant } from '../src/entities/restaurant.entity';
import { Favorite } from '../src/entities/favorite.entity';
import { User } from '../src/entities/user.entity';
import { Review } from '../src/entities/review.entity';
import { UserRole } from '../src/common/enums/user-role.enum';
import { AuthResponseDto } from '../src/auth/dto/auth-response.dto';

describe.only('Favorites (e2e)', () => {
  let app: INestApplication;
  let restaurantRepository: Repository<Restaurant>;
  let favoriteRepository: Repository<Favorite>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Restaurant, Favorite, User, Review],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    restaurantRepository = moduleFixture.get('RestaurantRepository');
    favoriteRepository = moduleFixture.get('FavoriteRepository');
    userRepository = moduleFixture.get('UserRepository');

    await app.init();
  });

  beforeEach(async () => {
    await favoriteRepository.clear();
    await restaurantRepository.clear();
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /me/favorites/:restaurantId', () => {
    it('should add restaurant to favorites (user)', async () => {
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

      const response = await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      const body = response.body as Favorite;
      expect(body.user_id).toBeDefined();
      expect(body.restaurant_id).toBe(restaurant.id);
    });

    it('should add restaurant to favorites (admin)', async () => {
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

      const response = await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      const body = response.body as Favorite;
      expect(body.user_id).toBeDefined();
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

      await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant.id}`)
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

      await request(app.getHttpServer() as Express)
        .post('/me/favorites/999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should fail when adding duplicate favorite', async () => {
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

      await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);
    });
  });

  describe('DELETE /me/favorites/:restaurantId', () => {
    it('should remove restaurant from favorites', async () => {
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

      await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      const response = await request(app.getHttpServer() as Express)
        .delete(`/me/favorites/${restaurant.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = response.body as { message: string };
      expect(body.message).toBe(
        'Restaurant removed from favorites successfully',
      );
    });

    it('should fail when removing non-existent favorite', async () => {
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

      await request(app.getHttpServer() as Express)
        .delete(`/me/favorites/${restaurant.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('GET /me/favorites', () => {
    it('should get user favorites', async () => {
      const restaurant1 = await restaurantRepository.save({
        name: 'Restaurant One',
        neighborhood: 'Manhattan',
        cuisine_type: 'Italian',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      const restaurant2 = await restaurantRepository.save({
        name: 'Restaurant Two',
        neighborhood: 'Brooklyn',
        cuisine_type: 'Mexican',
        address: '456 Oak Ave',
        lat: 40.6782,
        lng: -73.9442,
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

      await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant1.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant2.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      const response = await request(app.getHttpServer() as Express)
        .get('/me/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = response.body as Favorite[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
      expect(body[0]).toHaveProperty('restaurant');
      expect(body[0].restaurant?.name).toBe('Restaurant One');
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

      await request(app.getHttpServer() as Express)
        .post(`/me/favorites/${restaurant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      const response = await request(app.getHttpServer() as Express)
        .get('/me/favorites')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as Favorite[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
    });

    it('should return empty array when no favorites', async () => {
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

      const response = await request(app.getHttpServer() as Express)
        .get('/me/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = response.body as Favorite[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });
  });
});
