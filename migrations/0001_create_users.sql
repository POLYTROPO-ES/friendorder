-- 0001_create_users.sql
-- FriendOrder users table.
-- Identity comes from Cloudflare Access; the email is the user id.
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,                -- Cloudflare Access user id (Cf-Access-Authenticated-User-Id)
  email         TEXT NOT NULL UNIQUE,            -- user id by email
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
