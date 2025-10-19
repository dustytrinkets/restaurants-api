-- Migration: Create migrations tracking table
-- Purpose: This table keeps track of which migrations have been executed
-- Date: 2025-10-18
-- Author: Assistant

CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checksum VARCHAR(255)
);
