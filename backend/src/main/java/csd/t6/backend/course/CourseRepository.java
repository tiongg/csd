package csd.t6.backend.course;

import static csd.t6.jooq.tables.Course.COURSE;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.tables.records.CourseRecord;

@Repository
public class CourseRepository {
  private final DSLContext dsl;

  public CourseRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  public CourseRecord create(String title, String description, UUID creatorId, UUID teamId) {
    return dsl.insertInto(COURSE)
        .set(COURSE.TITLE, title)
        .set(COURSE.DESCRIPTION, description)
        .set(COURSE.CREATOR_ID, creatorId)
        .set(COURSE.TEAM_ID, teamId)
        .set(COURSE.IS_PUBLISHED, false)
        .returning()
        .fetchOne();
  }

  public Optional<CourseRecord> findById(UUID id) {
    return dsl.selectFrom(COURSE)
        .where(COURSE.ID.eq(id))
        .fetchOptional();
  }

  public List<CourseRecord> findAll() {
    return dsl.selectFrom(COURSE)
        .fetch();
  }

  public CourseRecord update(UUID id, String title, String description, UUID teamId, Boolean isPublished) {
    CourseRecord existing = findById(id).orElseThrow();

    if (title != null) {
      existing.setTitle(title);
    }
    if (description != null) {
      existing.setDescription(description);
    }
    if (teamId != null) {
      existing.setTeamId(teamId);
    }
    if (isPublished != null) {
      existing.setIsPublished(isPublished);
    }

    existing.store();
    return existing;
  }

  public void delete(UUID id) {
    dsl.deleteFrom(COURSE)
        .where(COURSE.ID.eq(id))
        .execute();
  }
}