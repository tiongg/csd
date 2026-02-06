-- learner UUID
CREATE TABLE pending_contributors (
  learner_id UUID PRIMARY KEY ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (learner_id) REFERENCES accounts.account(id) ON DELETE CASCADE
);

