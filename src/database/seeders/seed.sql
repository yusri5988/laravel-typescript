-- Seed data for local development.
-- Run with: npm run db:seed  (wrangler d1 execute hono-laravel --local --file=./src/database/seeders/seed.sql)
-- Password is: 123456
-- Hash format: pbkdf2$iterations$base64url-salt$base64url-derived-key.

INSERT INTO users (name, email, password_hash, role, created_at, updated_at) VALUES
  ('Admin', 'admin@gmail.com', 'pbkdf2$100000$Gl4ulo1mopSmnCr-4buwPQ$WtLVQmXvp7nkMHuOlD6-iR22wvnV3yiS2nKvzIY4Ji8', 'admin', strftime('%s','now'), strftime('%s','now'))
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  updated_at = excluded.updated_at;
