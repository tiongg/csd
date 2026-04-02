package csd.t6.backend.glossary;

import static csd.t6.jooq.public_.tables.GlossaryTerm.GLOSSARY_TERM;
import static csd.t6.jooq.public_.tables.GlossaryTermRelationship.GLOSSARY_TERM_RELATIONSHIP;
import static csd.t6.jooq.public_.tables.Tags.TAGS;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;
import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.tables.GlossaryTerm;
import csd.t6.jooq.public_.tables.records.GlossaryTermRecord;

@Repository
public class GlossaryRepository extends BaseRepository<GlossaryTermRecord> {
  public GlossaryRepository(DSLContext dsl) {
    super(dsl, GLOSSARY_TERM);
  }

  /**
   * Get all tags that do not have a glossary term
   */
  public List<String> getAllUnresolvedTerms() {
    return dsl.select(TAGS.TITLE).from(TAGS)
        .where(TAGS.TITLE.notIn(dsl.select(GLOSSARY_TERM.TITLE).from(GLOSSARY_TERM))).fetch(TAGS.TITLE);
  }

  public List<GlossaryTermRecord> getAll() {
    return this.findAll();
  }

  public List<GlossaryTermRecord> getByTitles(List<String> titles) {
    return dsl.selectFrom(GLOSSARY_TERM).where(GLOSSARY_TERM.TITLE.in(titles)).fetchInto(GlossaryTermRecord.class);
  }

  /**
   * Get all glossary terms with their relationship titles using joins. Returns a
   * map of glossary term ID to list of related term titles.
   */
  public Map<UUID, List<String>> getAllWithRelationshipTitles() {
    GlossaryTerm related = GLOSSARY_TERM.as("related");

    return dsl.select(GLOSSARY_TERM.ID, related.TITLE).from(GLOSSARY_TERM).leftJoin(GLOSSARY_TERM_RELATIONSHIP)
        .on(GLOSSARY_TERM.ID.eq(GLOSSARY_TERM_RELATIONSHIP.GLOSSARY_TERM_ID)).leftJoin(related)
        .on(GLOSSARY_TERM_RELATIONSHIP.RELATED_TERM_ID.eq(related.ID)).fetch().stream()
        .collect(Collectors.groupingBy(record -> record.get(GLOSSARY_TERM.ID), Collectors.mapping(
            record -> record.get(related.TITLE), Collectors.filtering(title -> title != null, Collectors.toList()))));
  }

  public GlossaryTermRecord upsert(GlossaryUpdateRequest request) {
    GlossaryTermRecord record = dsl.newRecord(GLOSSARY_TERM);

    record.setTitle(request.name());
    record.setDescription(request.description());
    record.setUsedInContext(request.usedInContext());
    record.setUsedInConversationExample(request.usedInConversationExample());

    return dsl.insertInto(GLOSSARY_TERM).set(record).onConflict(GLOSSARY_TERM.TITLE).doUpdate().set(record).returning()
        .fetchOne();
  }
}
