-- Remove old dummy account table
DROP TABLE IF EXISTS account;
CREATE SCHEMA IF NOT EXISTS accounts;

CREATE TYPE accounts.roles AS ENUM ('LEARNER', 'CONTRIBUTOR', 'ADMIN');
CREATE TABLE accounts.account (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  real_name TEXT,
  user_role accounts.roles NOT NULL DEFAULT 'LEARNER',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
