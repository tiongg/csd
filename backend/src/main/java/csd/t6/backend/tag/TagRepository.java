package csd.t6.backend.tag;

import static csd.t6.jooq.public_.tables.CourseTags.COURSE_TAGS;
import static csd.t6.jooq.public_.tables.Tags.TAGS;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.tables.records.TagsRecord;

@Repository
public class TagRepository extends BaseRepository<TagsRecord> {

  public TagRepository(DSLContext dsl) {
    super(dsl, TAGS);
  }

  /**
   * Find a tag by title
   */
  public Optional<TagsRecord> findByTitle(String title) {
    TagsRecord found = dsl.selectFrom(TAGS).where(TAGS.TITLE.equalIgnoreCase(title)).fetchOne();
    return Optional.ofNullable(found);
  }

  /**
   * Find an existing tag by title, or create a new one if it doesn't exist.
   */
  public TagsRecord findOrCreateByTitle(String title) {
    return findByTitle(title).orElseGet(() -> {
      TagsRecord newTag = dsl.newRecord(TAGS);
      newTag.setTitle(title);
      newTag.store();
      return newTag;
    });
  }

  /**
   * Get all tag records for a specific course.
   */
  public List<TagsRecord> getTagsByCourseId(UUID courseId) {
    return dsl.select(TAGS.fields()).from(TAGS).join(COURSE_TAGS).on(TAGS.ID.eq(COURSE_TAGS.TAG_ID))
        .where(COURSE_TAGS.COURSE_ID.eq(courseId)).fetchInto(TAGS);
  }

  /**
   * Get all tag titles for a specific course.
   */
  public List<String> getTagTitlesByCourseId(UUID courseId) {
    return dsl.select(TAGS.TITLE).from(TAGS).join(COURSE_TAGS).on(TAGS.ID.eq(COURSE_TAGS.TAG_ID))
        .where(COURSE_TAGS.COURSE_ID.eq(courseId)).fetch(TAGS.TITLE);
  }

  /**
   * Link a course to a tag.
   */
  public void linkCourseToTag(UUID courseId, UUID tagId) {
    dsl.insertInto(COURSE_TAGS).set(COURSE_TAGS.COURSE_ID, courseId).set(COURSE_TAGS.TAG_ID, tagId)
        .onConflict(COURSE_TAGS.COURSE_ID, COURSE_TAGS.TAG_ID).doNothing().execute();
  }

  /**
   * Unlink a course from a tag.
   */
  public void unlinkCourseFromTag(UUID courseId, UUID tagId) {
    dsl.deleteFrom(COURSE_TAGS).where(COURSE_TAGS.COURSE_ID.eq(courseId)).and(COURSE_TAGS.TAG_ID.eq(tagId)).execute();
  }

  /**
   * Remove all tag associations for a course.
   */
  public void unlinkAllTagsFromCourse(UUID courseId) {
    dsl.deleteFrom(COURSE_TAGS).where(COURSE_TAGS.COURSE_ID.eq(courseId)).execute();
  }

  /**
   * Get all tags.
   */
  public List<TagsRecord> findAll() {
    return dsl.selectFrom(TAGS).fetch();
  }

  /**
   * Find tags by title pattern (for autocomplete).
   */
  public List<TagsRecord> searchByTitle(String search) {
    return dsl.selectFrom(TAGS).where(TAGS.TITLE.likeIgnoreCase("%" + search + "%")).limit(10).fetch();
  }

  /**
   * Get tags ordered by usage count (most used first). Returns a list of records
   * with tag id, title, and usage count.
   */
  public List<TagUsageRecord> getTagsByUsageCount() {
    return dsl.select(TAGS.ID, TAGS.TITLE, DSL.count(COURSE_TAGS.COURSE_ID).as("usage_count")).from(TAGS)
        .leftJoin(COURSE_TAGS).on(TAGS.ID.eq(COURSE_TAGS.TAG_ID)).groupBy(TAGS.ID, TAGS.TITLE)
        .orderBy(DSL.field("usage_count").desc()).fetch().into(TagUsageRecord.class);
  }

  /**
   * Record class to hold tag usage information.
   */
  public static class TagUsageRecord {
    public UUID id;
    public String title;
    public int usageCount;
  }
}
