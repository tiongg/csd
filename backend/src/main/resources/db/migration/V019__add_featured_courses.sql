-- Add is_featured column to course table
ALTER TABLE course ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for efficient featured course queries
CREATE INDEX idx_course_featured ON course(is_featured);
