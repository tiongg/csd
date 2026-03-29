package csd.t6.backend.glossary;

import static csd.t6.jooq.public_.tables.GlossaryTermRelationship.GLOSSARY_TERM_RELATIONSHIP;

import java.util.List;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.tables.records.GlossaryTermRelationshipRecord;

@Repository
public class GlossaryRelationRepository extends BaseRepository<GlossaryTermRelationshipRecord> {
  public GlossaryRelationRepository(DSLContext dsl) {
    super(dsl, GLOSSARY_TERM_RELATIONSHIP);
  }

  public void setRelationships(UUID parentTermId, List<UUID> childTermIds) {
    // Delete existing relationships for the parent term
    dsl.deleteFrom(GLOSSARY_TERM_RELATIONSHIP).where(GLOSSARY_TERM_RELATIONSHIP.GLOSSARY_TERM_ID.eq(parentTermId))
        .execute();

    // Insert new relationships
    for (UUID childTermId : childTermIds) {
      GlossaryTermRelationshipRecord record = dsl.newRecord(GLOSSARY_TERM_RELATIONSHIP);
      record.setGlossaryTermId(parentTermId);
      record.setRelatedTermId(childTermId);
      this.save(record);
    }
  }
}
