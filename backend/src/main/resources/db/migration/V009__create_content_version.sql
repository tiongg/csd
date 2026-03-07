CREATE TYPE content_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE content_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  version INTEGER NOT NULL,
  description TEXT NOT NULL,
  rejected_reason TEXT,
  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
  UNIQUE (course_id, version)
);