-- Drop the old foreign key constraint with ON DELETE SET NULL
ALTER TABLE learner_activity DROP CONSTRAINT learner_activity_course_id_fkey;

-- Add the new foreign key constraint with ON DELETE CASCADE
ALTER TABLE learner_activity
  ADD CONSTRAINT learner_activity_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;
