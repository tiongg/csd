CREATE TYPE accounts.oauth_provider AS ENUM ('GOOGLE');

-- Make password_hash nullable to support OAuth-only users
ALTER TABLE accounts.account ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE accounts.oauth_connection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  provider accounts.oauth_provider NOT NULL,
  provider_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_id)
);

-- Index for fast lookups by provider and provider_id
CREATE INDEX idx_oauth_connection_provider ON accounts.oauth_connection(provider, provider_id);
