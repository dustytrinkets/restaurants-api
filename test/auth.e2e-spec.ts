import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpException } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Express } from 'express';
import { Repository } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { User } from '../src/entities/user.entity';
import { UserRole } from '../src/common/enums/user-role.enum';
import { AuthResponseDto } from '../src/auth/dto/auth-response.dto';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        AuthModule,
      ],
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

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user_id');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('role', UserRole.USER);
      expect((response.body as AuthResponseDto).access_token).toBeDefined();
      expect(typeof (response.body as AuthResponseDto).access_token).toBe(
        'string',
      );
    });

    it('should register a new user with ADMIN role', async () => {
      const registerData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('role', UserRole.ADMIN);
      expect(response.body).toHaveProperty('email', 'admin@example.com');
    });

    it('should return 409 when trying to register with existing email', async () => {
      const registerData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'First User',
      };

      await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData)
        .expect(409);

      expect((response.body as HttpException).message).toContain(
        'already exists',
      );
    });

    it('should return 400 for invalid email', async () => {
      const registerData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData)
        .expect(400);

      expect((response.body as HttpException).message[0]).toContain('email');
    });

    it('should return 400 for password too short', async () => {
      const registerData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData)
        .expect(400);

      expect((response.body as HttpException).message[0]).toContain('password');
    });

    it('should return 400 and an array of errors for missing required fields', async () => {
      const registerData = {
        email: 'test@example.com',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData)
        .expect(400);

      expect((response.body as HttpException).message.length).toBe(3);
      expect((response.body as HttpException).message[1]).toContain('password');
      expect((response.body as HttpException).message[2]).toContain('name');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const registerData = {
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
      };

      await request(app.getHttpServer() as Express)
        .post('/auth/register')
        .send(registerData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user_id');
      expect(response.body).toHaveProperty('email', 'login@example.com');
      expect(response.body).toHaveProperty('name', 'Login User');
      expect(response.body).toHaveProperty('role', UserRole.USER);
      expect((response.body as AuthResponseDto).access_token).toBeDefined();
      expect(typeof (response.body as AuthResponseDto).access_token).toBe(
        'string',
      );
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect((response.body as HttpException).message).toContain(
        'Invalid credentials',
      );
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect((response.body as HttpException).message).toContain(
        'Invalid credentials',
      );
    });

    it('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect((response.body as HttpException).message[0]).toContain('email');
    });

    it('should return 400 for password too short', async () => {
      const loginData = {
        email: 'login@example.com',
        password: '123',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect((response.body as HttpException).message[0]).toContain('password');
    });

    it('should return 400 for missing required fields', async () => {
      const loginData = {
        email: 'login@example.com',
      };

      const response = await request(app.getHttpServer() as Express)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect((response.body as HttpException).message.length).toBe(2);
      expect((response.body as HttpException).message[0]).toContain('password');
    });
  });

  describe('Integration scenarios', () => {
    it('should allow user to register and then login', async () => {
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

      const loginResponse = await request(app.getHttpServer() as Express)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect((loginResponse.body as AuthResponseDto).email).toBe(
        userData.email,
      );
      expect((loginResponse.body as AuthResponseDto).name).toBe(userData.name);
      expect((loginResponse.body as AuthResponseDto).user_id).toBe(
        (registerResponse.body as AuthResponseDto).user_id,
      );
    });

    it('should handle multiple users with different roles', async () => {
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

      expect((userResponse.body as AuthResponseDto).role).toBe(UserRole.USER);
      expect((adminResponse.body as AuthResponseDto).role).toBe(UserRole.ADMIN);
      expect((userResponse.body as AuthResponseDto).user_id).not.toBe(
        (adminResponse.body as AuthResponseDto).user_id,
      );
    });
  });
});
