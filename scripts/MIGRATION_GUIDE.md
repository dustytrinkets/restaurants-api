# SQLite to PostgreSQL Migration Guide (Docker)

## 🎯 **Goal**
Migrate your existing SQLite data to PostgreSQL using Docker for consistent development and production environments.

## 📋 **Prerequisites**

### **1. Install Docker**
```bash
# macOS
brew install --cask docker

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

### **2. No Local PostgreSQL Installation Needed!**
Docker will handle everything for you! 🎉

## 🔄 **Migration Steps**

### **Step 1: Start Local Development Services**
```bash
# Start PostgreSQL, Redis, PgAdmin, and your app
npm run docker:up
```

### **Step 2: Set Environment Variables**
```bash
# Copy environment file
cp env.dev .env

# Or set manually
export DATABASE_URL=postgresql://postgres:password@localhost:5432/restaurants_dev
```

### **Step 3: Run Migrations**
```bash
# Create tables in PostgreSQL
npm run migration:run
```

### **Step 4: Migrate Data**
```bash
# Migrate your SQLite data to PostgreSQL
npm run migrate:sqlite-to-postgres
```

### **Step 5: Start Your App**
```bash
# Start your NestJS app
npm run start:dev
```

### **🚀 One-Command Setup**
```bash
# Everything in one command!
npm run dev:setup
```

## ✅ **Verification**

### **Check Services**
```bash
# Check Docker containers
docker ps

# Check logs
npm run docker:logs
```

### **Check Data in PostgreSQL**
```bash
# Connect to your database
docker exec -it restaurants-postgres-local psql -U postgres -d restaurants_dev

# Check tables
\dt

# Check data
SELECT COUNT(*) FROM restaurants;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM reviews;

# Exit
\q
```

### **Access PgAdmin (Database Admin)**
- Visit `http://localhost:8081`
- Email: `admin@restaurants.com`
- Password: `admin`
- Add server: `postgres` (host: `postgres`, port: `5432`, user: `postgres`, password: `password`)

### **Test Your App**
- Visit `http://localhost:3000/api/docs`
- Test all endpoints
- Verify all your restaurants are there

## 🚀 **Deploy to Railway**

Your Railway deployment will automatically use PostgreSQL and run migrations.

## 🧹 **Cleanup (Optional)**

After successful migration, you can remove SQLite files:
```bash
# Remove SQLite database (optional)
rm data/restaurants.db

# Remove SQLite migration files (optional)
rm src/migrations/*-sqlite.sql
```

## 🆘 **Troubleshooting**

### **Connection Issues**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Check database exists
psql -l | grep restaurants_dev
```

### **Migration Issues**
```bash
# Reset migrations (if needed)
psql restaurants_dev -c "DROP TABLE IF EXISTS migrations CASCADE;"
npm run migration:run
```

### **Data Issues**
```bash
# Check data counts
psql restaurants_dev -c "SELECT 'restaurants' as table, COUNT(*) FROM restaurants UNION ALL SELECT 'users', COUNT(*) FROM users UNION ALL SELECT 'reviews', COUNT(*) FROM reviews;"
```
