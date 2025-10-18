-- Migration: Create migrations tracking table
-- This table keeps track of which migrations have been executed

CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  checksum TEXT
);
