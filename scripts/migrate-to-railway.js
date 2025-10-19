#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const SQLITE_DB = './data/restaurants.db';
const RAILWAY_URL = 'postgresql://postgres:cOtahPeunZyrGnpYeZktQdCPirIoWrTt@metro.proxy.rlwy.net:16763/railway';

if (!RAILWAY_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.log('💡 Get your Railway DATABASE_URL from Railway dashboard:');
  console.log('   1. Go to Railway dashboard');
  console.log('   2. Click on your PostgreSQL service');
  console.log('   3. Go to "Variables" tab');
  console.log('   4. Copy the DATABASE_URL');
  console.log('   5. Run: export DATABASE_URL="your-url-here"');
  console.log('   6. Then run: npm run migrate:to-railway');
  process.exit(1);
}

async function migrateToRailway() {
  console.log('🔄 Starting SQLite to Railway PostgreSQL migration...');
  
  // Connect to SQLite
  const sqliteDb = new sqlite3.Database(SQLITE_DB, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('❌ Error connecting to SQLite:', err.message);
      process.exit(1);
    }
    console.log('✅ Connected to SQLite');
  });

  // Connect to Railway PostgreSQL
  const pgClient = new Client({
    connectionString: RAILWAY_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pgClient.connect();
    console.log('✅ Connected to Railway PostgreSQL');

    // Get data from SQLite
    const users = await getSqliteData(sqliteDb, 'users');
    const restaurants = await getSqliteData(sqliteDb, 'restaurants');
    const reviews = await getSqliteData(sqliteDb, 'reviews');
    const favorites = await getSqliteData(sqliteDb, 'favorites');
    const operatingHours = await getSqliteData(sqliteDb, 'operating_hours');
    
    console.log(`📊 Found ${users.length} users, ${restaurants.length} restaurants, ${reviews.length} reviews, ${favorites.length} favorites, ${operatingHours.length} operating hours`);
    
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await pgClient.query('TRUNCATE TABLE operating_hours, favorites, reviews, restaurants, users RESTART IDENTITY CASCADE');
    
    // Insert data into Railway PostgreSQL
    await insertUsers(pgClient, users);
    await insertRestaurants(pgClient, restaurants);
    await insertReviews(pgClient, reviews);
    await insertFavorites(pgClient, favorites);
    await insertOperatingHours(pgClient, operatingHours);
    
    console.log('✅ Migration to Railway completed successfully!');
    console.log('🚀 Your Railway app now has all your data!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

function getSqliteData(db, table) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${table}`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function insertUsers(client, users) {
  console.log('👥 Migrating users...');
  for (const user of users) {
    await client.query(
      'INSERT INTO users (email, password, name, role, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      [user.email, user.password, user.name, user.role, user.created_at]
    );
  }
  console.log(`✅ Migrated ${users.length} users`);
}

async function insertRestaurants(client, restaurants) {
  console.log('🍽️ Migrating restaurants...');
  for (const restaurant of restaurants) {
    await client.query(
      'INSERT INTO restaurants (name, neighborhood, photograph, address, lat, lng, image, cuisine_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [restaurant.name, restaurant.neighborhood, restaurant.photograph, restaurant.address, restaurant.lat, restaurant.lng, restaurant.image, restaurant.cuisine_type]
    );
  }
  console.log(`✅ Migrated ${restaurants.length} restaurants`);
}

async function insertReviews(client, reviews) {
  console.log('⭐ Migrating reviews...');
  for (const review of reviews) {
    await client.query(
      'INSERT INTO reviews (restaurant_id, user_id, rating, comments, date, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [review.restaurant_id, review.user_id, review.rating, review.comments, review.date, review.created_at]
    );
  }
  console.log(`✅ Migrated ${reviews.length} reviews`);
}

async function insertFavorites(client, favorites) {
  console.log('❤️ Migrating favorites...');
  for (const favorite of favorites) {
    await client.query(
      'INSERT INTO favorites (user_id, restaurant_id, created_at) VALUES ($1, $2, $3) ON CONFLICT (user_id, restaurant_id) DO NOTHING',
      [favorite.user_id, favorite.restaurant_id, favorite.created_at]
    );
  }
  console.log(`✅ Migrated ${favorites.length} favorites`);
}

async function insertOperatingHours(client, operatingHours) {
  console.log('⏰ Migrating operating hours...');
  for (const oh of operatingHours) {
    await client.query(
      'INSERT INTO operating_hours (restaurant_id, day, hours) VALUES ($1, $2, $3)',
      [oh.restaurant_id, oh.day, oh.hours]
    );
  }
  console.log(`✅ Migrated ${operatingHours.length} operating hours`);
}

// Run migration
migrateToRailway().catch(console.error);
