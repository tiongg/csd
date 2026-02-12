CREATE SCHEMA IF NOT EXISTS teams;

-- Team roles enum
CREATE TYPE teams.team_role AS ENUM ('OWNER', 'ADMIN', 'CONTRIBUTOR');

-- Teams table
CREATE TABLE teams.team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team members table (junction table)
CREATE TABLE teams.team_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams.team(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  team_role teams.team_role NOT NULL DEFAULT 'CONTRIBUTOR',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, account_id)
);

-- Indexes for performance
CREATE INDEX idx_team_owner ON teams.team(owner_id);
CREATE INDEX idx_team_member_team ON teams.team_member(team_id);
CREATE INDEX idx_team_member_account ON teams.team_member(account_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION teams.update_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_updated_at
BEFORE UPDATE ON teams.team
FOR EACH ROW
EXECUTE FUNCTION teams.update_team_updated_at();