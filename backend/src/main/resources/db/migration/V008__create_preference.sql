CREATE TABLE accounts.preference (
  account_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  topic text NOT NULL,
  PRIMARY KEY (account_id, topic)
);