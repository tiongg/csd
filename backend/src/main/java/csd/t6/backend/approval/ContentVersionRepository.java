package csd.t6.backend.approval;

import static csd.t6.jooq.public_.tables.ContentVersion.CONTENT_VERSION;

import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.enums.ContentStatus;
import csd.t6.jooq.public_.tables.records.ContentVersionRecord;

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
}
