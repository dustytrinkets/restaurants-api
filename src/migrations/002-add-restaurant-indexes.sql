CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type);

CREATE INDEX IF NOT EXISTS idx_restaurants_neighborhood ON restaurants(neighborhood);

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_neighborhood ON restaurants(cuisine_type, neighborhood);
