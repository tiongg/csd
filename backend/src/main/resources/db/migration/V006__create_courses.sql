CREATE SCHEMA IF NOT EXISTS courses;

-- Courses table
CREATE TABLE courses.course (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams.team(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_course_creator ON courses.course(creator_id);
CREATE INDEX idx_course_team ON courses.course(team_id);
CREATE INDEX idx_course_published ON courses.course(is_published);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION courses.update_course_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_updated_at
BEFORE UPDATE ON courses.course
FOR EACH ROW
EXECUTE FUNCTION courses.update_course_updated_at();