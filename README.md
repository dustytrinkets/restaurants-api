# Restaurants API

A NestJS-based REST API for managing restaurants, reviews, and user favorites.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm run test:all
```

### Docker Development
```bash
# Start with Docker
npm run docker:up

# View logs
npm run docker:logs

# Stop
npm run docker:down
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

### SQLite Database
- **Location**: `data/restaurants.db`
- **Migrations**: Automatic on startup (development only)
- **Admin Interface**: http://localhost:8080 (when using Docker)

### Migration Commands
```bash
# Check migration status
npm run migration:status

# Run migrations manually
npm run migration:run
```

## 🐳 Docker

### Services
- **API**: http://localhost:3000
- **Database Admin**: http://localhost:8080
- **Redis**: localhost:6379

### Commands
```bash
npm run docker:up      # Start services
npm run docker:down    # Stop services
npm run docker:logs    # View logs
npm run docker:build   # Build image
npm run docker:clean   # Clean up
```

## 🚀 Deployment

### GitHub Actions
Push to `main` branch to trigger automated deployment:
- ✅ Runs tests
- ✅ Builds application
- ✅ Runs migrations
- ✅ Ready for deployment

### Environment Variables
```bash
DATABASE_URL=sqlite:///tmp/restaurants.db
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

## 🔧 Development

### Project Structure
```
src/
├── admin/           # Admin endpoints
├── auth/            # Authentication
├── common/          # Shared services
├── entities/        # Database entities
├── favorites/       # User favorites
├── migrations/      # Database migrations
├── restaurants/     # Restaurant management
├── reviews/         # Review system
└── users/           # User management
```

### Key Features
- **Authentication**: JWT-based auth with roles
- **Rate Limiting**: API protection
- **Caching**: Redis for performance
- **Migrations**: Database schema management
- **Validation**: Request/response validation
- **Documentation**: Swagger UI at `/api/docs`

## 📊 API Documentation

Visit http://localhost:3000/api/docs for interactive API documentation.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

## 📝 License

Private project - All rights reserved.