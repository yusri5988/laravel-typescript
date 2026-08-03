-- Seed data for local development.
-- Run with: npm run db:seed  (wrangler d1 execute hono-laravel --local --file=./src/database/seeders/seed.sql)
-- Password is: password123
-- Hash format: pbkdf2$iterations$base64url-salt$base64url-derived-key.

INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES
  ('Alice Example',  'alice@example.com',  'pbkdf2$120000$ZGVtby1zYWx0LTE2$mQbiV_eW3dNqYlkuF-SaN6KC1nymWA3tUzZh64DMTyc', strftime('%s','now'), strftime('%s','now')),
  ('Bob Example',    'bob@example.com',    'pbkdf2$120000$ZGVtby1zYWx0LTE2$mQbiV_eW3dNqYlkuF-SaN6KC1nymWA3tUzZh64DMTyc', strftime('%s','now'), strftime('%s','now'));
