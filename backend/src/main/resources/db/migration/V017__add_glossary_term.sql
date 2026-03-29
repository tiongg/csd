ALTER TABLE tags DROP COLUMN description;

CREATE TABLE glossary_term (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title CITEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  used_in_conversation_example TEXT NOT NULL,
  used_in_context TEXT NOT NULL
);

CREATE TABLE glossary_term_relationship (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  glossary_term_id UUID NOT NULL,
  related_term_id UUID NOT NULL,
  FOREIGN KEY (glossary_term_id) REFERENCES glossary_terms(id) ON DELETE CASCADE,
  FOREIGN KEY (related_term_id) REFERENCES glossary_terms(id) ON DELETE CASCADE,
  UNIQUE (glossary_term_id, related_term_id)
);