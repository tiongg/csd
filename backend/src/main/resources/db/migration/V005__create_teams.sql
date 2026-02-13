-- Team roles enum (renamed CONTRIBUTOR to MEMBER)
CREATE TYPE team_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- Teams table
CREATE TABLE team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE team_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  team_role team_role NOT NULL DEFAULT 'MEMBER',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, account_id)
);

-- Indexes
CREATE INDEX idx_team_owner ON team(owner_id);
CREATE INDEX idx_team_member_team ON team_member(team_id);
CREATE INDEX idx_team_member_account ON team_member(account_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_updated_at
BEFORE UPDATE ON team
FOR EACH ROW
EXECUTE FUNCTION update_team_updated_at();