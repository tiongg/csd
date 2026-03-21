package csd.t6.backend.approval;

import static csd.t6.jooq.public_.tables.ContentVersion.CONTENT_VERSION;
import static csd.t6.jooq.public_.tables.Course.COURSE;
import static csd.t6.jooq.public_.tables.CourseTags.COURSE_TAGS;
import static csd.t6.jooq.public_.tables.Tags.TAGS;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record2;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import csd.t6.backend.approval.util.ContentVersionWithCourseRecord;
import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.enums.ContentStatus;
import csd.t6.jooq.public_.tables.ContentVersion;
import csd.t6.jooq.public_.tables.Course;
import csd.t6.jooq.public_.tables.records.ContentVersionRecord;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@Repository
public class ContentVersionRepository extends BaseRepository<ContentVersionRecord> {
  public ContentVersionRepository(DSLContext dsl) {
    super(dsl, CONTENT_VERSION);
  }

  public int getLatestVersionNumberForCourse(UUID courseId) {
    return Optional
        .ofNullable(dsl.selectFrom(CONTENT_VERSION).where(CONTENT_VERSION.COURSE_ID.eq(courseId))
            .orderBy(CONTENT_VERSION.VERSION.desc()).limit(1).fetchOne())
        .map(ContentVersionRecord::getVersion).orElse(0);
  }

  public ContentVersionRecord create(UUID courseId, int versionNumber, String description) {
    ContentVersionRecord record = dsl.insertInto(CONTENT_VERSION).set(CONTENT_VERSION.COURSE_ID, courseId)
        .set(CONTENT_VERSION.VERSION, versionNumber).set(CONTENT_VERSION.DESCRIPTION, description).returning()
        .fetchOne();
    return record;
  }

  public void rejectAllPendingVersions(UUID courseId) {
    dsl.update(CONTENT_VERSION).set(CONTENT_VERSION.STATUS, ContentStatus.REJECTED)
        .set(CONTENT_VERSION.REJECTED_REASON, "Newer version uploaded")
        .where(CONTENT_VERSION.COURSE_ID.eq(courseId).and(CONTENT_VERSION.STATUS.eq(ContentStatus.PENDING))).execute();
  }

  public List<CourseRecord> findCoursesWithApprovedVersion() {
    ContentVersion cv = CONTENT_VERSION;
    Course c = COURSE;

    Table<Record2<UUID, Integer>> latest = DSL
        .select(cv.COURSE_ID.as("course_id"), DSL.max(cv.VERSION).as("max_version")).from(cv)
        .where(cv.STATUS.eq(ContentStatus.APPROVED)).groupBy(cv.COURSE_ID).asTable("latest");

    Field<UUID> L_COURSE_ID = latest.field("course_id", UUID.class);
    Field<Integer> L_VERSION = latest.field("max_version", Integer.class);

    return this.dsl.select(c).from(c).join(cv).on(cv.COURSE_ID.eq(c.ID)).join(latest).on(L_COURSE_ID.eq(cv.COURSE_ID))
        .and(L_VERSION.eq(cv.VERSION)).where(cv.STATUS.eq(ContentStatus.APPROVED)).fetch()
        .map(record -> record.value1());
  }

  public List<ContentVersionWithCourseRecord> findByStatusWithCourse(ContentStatus status) {
    ContentVersion cv = CONTENT_VERSION;
    Course c = COURSE;

    return this.dsl.select(cv, c).from(cv).join(c).on(cv.COURSE_ID.eq(c.ID)).where(cv.STATUS.eq(status)).fetch()
        .map(record -> {
          ContentVersionRecord contentVersion = record.value1();
          CourseRecord course = record.value2();
          List<String> tags = getTagTitlesByCourseId(course.getId());
          return new ContentVersionWithCourseRecord(contentVersion, course, tags);
        });
  }

  private List<String> getTagTitlesByCourseId(UUID courseId) {
    return dsl
        .select(TAGS.TITLE)
        .from(TAGS)
        .join(COURSE_TAGS).on(TAGS.ID.eq(COURSE_TAGS.TAG_ID))
        .where(COURSE_TAGS.COURSE_ID.eq(courseId))
        .fetch(TAGS.TITLE);
  }

  public void updateStatus(UUID contentVersionId, ContentStatus status, String rejectedReason) {
    dsl.update(CONTENT_VERSION)
        .set(CONTENT_VERSION.STATUS, status)
        .set(CONTENT_VERSION.REJECTED_REASON, rejectedReason)
        .where(CONTENT_VERSION.ID.eq(contentVersionId))
        .execute();
  }
}
