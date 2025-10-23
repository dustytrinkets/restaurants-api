import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Express } from 'express';
import request from 'supertest';
import { Repository } from 'typeorm';

import { AuthResponseDto } from '../src/auth/dto/auth-response.dto';
import { UserRole } from '../src/common/enums/user-role.enum';
import { User } from '../src/entities/user.entity';
import { UserProfileDto } from '../src/users/dto/user-profile.dto';

import { TestAppModule } from './test-app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

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
    await app.init();

    userRepository = app.get(getRepositoryToken(User));
  });

  afterEach(async () => {
    if (userRepository) {
      await userRepository.clear();
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/me', () => {
    let authToken: string;
    let userId: number;

    beforeEach(async () => {
      const registerData = {
        email: 'me@example.com',
        password: 'password123',
        name: 'Me User',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      authToken = (response.body as AuthResponseDto).access_token;
      userId = (response.body as AuthResponseDto).user_id;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer() as Express)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect((response.body as UserProfileDto).id).toBe(userId);
      expect((response.body as UserProfileDto).email).toBe('me@example.com');
      expect((response.body as UserProfileDto).name).toBe('Me User');
      expect((response.body as UserProfileDto).role).toBe(UserRole.USER);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer() as Express)
        .get('/users/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer() as Express)
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 with malformed authorization header', async () => {
      await request(app.getHttpServer() as Express)
        .get('/users/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should allow USER role to access /me', async () => {
      const response = await request(app.getHttpServer() as Express)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect((response.body as UserProfileDto).role).toBe(UserRole.USER);
    });

    it('should allow ADMIN role to access /me', async () => {
      const adminRegisterData = {
        email: 'admin-me@example.com',
        password: 'password123',
        name: 'Admin Me',
        role: UserRole.ADMIN,
      };

      const adminResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(adminRegisterData)
        .expect(201);

      const adminToken = (adminResponse.body as AuthResponseDto).access_token;

      const response = await request(app.getHttpServer() as Express)
        .get('/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect((response.body as UserProfileDto).role).toBe(UserRole.ADMIN);
    });
  });

  describe('Integration scenarios', () => {
    it('should allow user to register, login, and get profile', async () => {
      const userData = {
        email: 'integration@example.com',
        password: 'password123',
        name: 'Integration User',
      };

      const registerResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect((registerResponse.body as AuthResponseDto).email).toBe(
        userData.email,
      );
      expect((registerResponse.body as AuthResponseDto).name).toBe(
        userData.name,
      );

      const authToken = (registerResponse.body as AuthResponseDto).access_token;

      const profileResponse = await request(app.getHttpServer() as Express)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect((profileResponse.body as UserProfileDto).email).toBe(
        userData.email,
      );
      expect((profileResponse.body as UserProfileDto).name).toBe(userData.name);
      expect((profileResponse.body as UserProfileDto).role).toBe(UserRole.USER);
    });

    it('should handle multiple users with different roles accessing their profiles', async () => {
      const userResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send({
          email: 'roles-user@example.com',
          password: 'password123',
          name: 'Regular User',
        })
        .expect(201);

      const adminResponse = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send({
          email: 'roles-admin@example.com',
          password: 'password123',
          name: 'Admin User',
          role: UserRole.ADMIN,
        })
        .expect(201);

      const userToken = (userResponse.body as AuthResponseDto).access_token;
      const adminToken = (adminResponse.body as AuthResponseDto).access_token;

      const userProfileResponse = await request(app.getHttpServer() as Express)
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect((userProfileResponse.body as UserProfileDto).role).toBe(
        UserRole.USER,
      );
      expect((userProfileResponse.body as UserProfileDto).email).toBe(
        'roles-user@example.com',
      );

      const adminProfileResponse = await request(app.getHttpServer() as Express)
        .get('/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect((adminProfileResponse.body as UserProfileDto).role).toBe(
        UserRole.ADMIN,
      );
      expect((adminProfileResponse.body as UserProfileDto).email).toBe(
        'roles-admin@example.com',
      );
    });
  });
});
