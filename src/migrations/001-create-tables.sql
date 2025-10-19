-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  neighborhood TEXT,
  photograph TEXT,
  address TEXT,
  lat REAL,
  lng REAL,
  image TEXT,
  cuisine_type TEXT
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER,
  user_id INTEGER,
  rating INTEGER,
  comments TEXT,
  date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, restaurant_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create operating_hours table
CREATE TABLE IF NOT EXISTS operating_hours (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER,
  day TEXT,
  hours TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
