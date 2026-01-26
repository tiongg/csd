CREATE TABLE accounts.oauth_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  account_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by code
CREATE INDEX idx_oauth_code_code ON accounts.oauth_code(code);

-- Index for cleanup of expired codes
CREATE INDEX idx_oauth_code_expires_at ON accounts.oauth_code(expires_at);
