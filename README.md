# 🍴 Restaurants API

## 🗺️ Project Architecture Overview

This project is a NestJS backend API built in TypeScript, designed to manage restaurants, users, reviews, and favorites.
It follows a modular and scalable architecture, aligned with best practices for maintainability and future growth.

### ⚒️ Key Technologies

- NestJS – for structured, modular application design.

- TypeORM – ORM used for database management and entity relationships.

- PostgreSQL – main database for persistence.

- JWT Authentication – for secure user sessions.

- Swagger – for API documentation can be found [here](https://restaurants-api-production-9595.up.railway.app/api/docs).

- Throttler – for rate limiting and basic protection against abuse.

- GitHub Actions – handles continuous integration and automated testing before deployment.
- Railway – for deployment and managed PostgreSQL hosting.

### ⚙️ Main Modules

- Auth Module – Handles registration, login, and JWT token generation.

- Users Module – Manages user profiles and authenticated routes (/me).

- Restaurants Module – Public endpoints with pagination, filters, and sorting.

- Reviews Module – Allows users to create, edit, or delete reviews.

- Favorites Module – Users can add or remove favorite restaurants.

- Admin Module – Restricted to ADMIN users for managing restaurants and viewing statistics.

- Middleware and Guards

- Auth Middleware / JWT Guard – Validates tokens and attaches the authenticated user to the request.

- Roles Guard – Restricts access based on user role (USER or ADMIN).

- Throttler Guard – Applies request rate limits based on client IP.

### 🪜 Scalability Considerations

The app is designed with scalability in mind:

- Rate limiting and caching prepared for high-traffic environments.

- Docker-ready: Can be containerized for cloud deployment.

- Database pooling and pagination ensure performance under load.

### 🔌 Deployment

The API CI/CD is on Github Actions & Railway, which automatically build and serve the NestJS application.


## 🚀 Quick Start

### 👷‍♀️ Development

1. Add the .env file
```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=dev-jwt-secret
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://localhost/restaurants_dev
```

2. Install dependencies `npm install`

3. Start the local db on docker `npm run docker:up`

4. Start development server `npm run start:dev`

5. You can also start with docker `npm run docker:up`

6. Run tests `npm run test:all`


### 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

## 📋 API Endpoints

### Public
- `GET /restaurants` - List restaurants (with pagination, filters, sorting)
- `GET /restaurants/:id` - Get restaurant details
- `GET /restaurants/:id/reviews` - Get restaurant reviews
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Authenticated (USER/ADMIN)
- `GET /me` - Get user profile
- `GET /me/reviews` - Get user's reviews
- `POST /restaurants/:id/reviews` - Create review
- `PUT /me/reviews/:id` - Update review
- `DELETE /me/reviews/:id` - Delete review
- `POST /me/favorites/:restaurantId` - Add to favorites
- `DELETE /me/favorites/:restaurantId` - Remove from favorites
- `GET /me/favorites` - Get user's favorites

### Admin Only
- `POST /restaurants` - Create restaurant
- `PUT /restaurants/:id` - Update restaurant
- `DELETE /restaurants/:id` - Delete restaurant
- `GET /admin/stats` - Get system statistics

## 🗄️ Database

### Postgres Database
- **Migrations**: Automatic on startup (TBD on CI/CD on production)

### Migration Commands
```bash
# Check migration status
npm run migration:status

# Run migrations manually
npm run migration:run
```

## 📊 API Documentation

Visit http://localhost:3000/api/docs for interactive API documentation.

## 🚀 Deployment

### GitHub Actions & Railway
Push to `main` branch to trigger automated deployment:
- ✅ Runs tests
- ✅ Builds application
- ✅ Runs migrations
- ✅ Deployment on railway
