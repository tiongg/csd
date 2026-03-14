CREATE TYPE learner_course_status AS ENUM ('ENROLLED', 'COMPLETED');

CREATE TABLE learner_course (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status learner_course_status NOT NULL DEFAULT 'ENROLLED',
  completed_at TIMESTAMP,
  metadata JSONB NOT NULL DEFAULT '{}',
  UNIQUE (course_id, user_id),
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "accounts"."account"(id) ON DELETE CASCADE
);