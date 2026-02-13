-- Courses table
CREATE TABLE course (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_course_creator ON course(creator_id);
CREATE INDEX idx_course_team ON course(team_id);
CREATE INDEX idx_course_published ON course(is_published);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_course_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_updated_at
BEFORE UPDATE ON course
FOR EACH ROW
EXECUTE FUNCTION update_course_updated_at();