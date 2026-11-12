-- Add case-insensitive unique usernames for existing accounts.
-- The deterministic suffix keeps existing accounts unique without changing IDs.
BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
UPDATE users
SET username = LOWER(SPLIT_PART(email, '@', 1)) || '_' || REPLACE(id, '-', '_')
WHERE username IS NULL OR BTRIM(username) = '';
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_ci ON users (LOWER(username));

CREATE TABLE IF NOT EXISTS app_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
