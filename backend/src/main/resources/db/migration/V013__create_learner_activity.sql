CREATE TYPE learner_activity_type AS ENUM (
  'COURSE_ENROLLED',
  'COURSE_COMPLETED',
  'METADATA_UPDATED'
);

-- Learner activity tracking table
CREATE TABLE learner_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  activity_type learner_activity_type NOT NULL,
  activity_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

  FOREIGN KEY (user_id) REFERENCES "accounts"."account"(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE SET NULL
);

CREATE INDEX idx_learner_activity_user_timestamp ON learner_activity(user_id, activity_timestamp DESC);
CREATE INDEX idx_learner_activity_course ON learner_activity(course_id);
CREATE INDEX idx_learner_activity_type ON learner_activity(activity_type);
