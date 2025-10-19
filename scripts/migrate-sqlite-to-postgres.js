#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const SQLITE_DB = './data/restaurants.db';
const POSTGRES_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/restaurants_dev';

async function migrateData() {
  console.log('🔄 Starting SQLite to PostgreSQL migration...');
  
  // Connect to SQLite
  const sqliteDb = new sqlite3.Database(SQLITE_DB);
  
  // Connect to PostgreSQL
  const pgClient = new Client({
    connectionString: POSTGRES_URL,
  });
  
  try {
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Get data from SQLite
    const users = await getSqliteData(sqliteDb, 'users');
    const restaurants = await getSqliteData(sqliteDb, 'restaurants');
    const reviews = await getSqliteData(sqliteDb, 'reviews');
    const favorites = await getSqliteData(sqliteDb, 'favorites');
    const operatingHours = await getSqliteData(sqliteDb, 'operating_hours');
    
    console.log(`📊 Found ${users.length} users, ${restaurants.length} restaurants, ${reviews.length} reviews, ${favorites.length} favorites, ${operatingHours.length} operating hours`);
    
    // Insert data into PostgreSQL
    await insertUsers(pgClient, users);
    await insertRestaurants(pgClient, restaurants);
    await insertReviews(pgClient, reviews);
    await insertFavorites(pgClient, favorites);
    await insertOperatingHours(pgClient, operatingHours);
    
    console.log('✅ Migration completed successfully!');
    
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
migrateData().catch(console.error);
