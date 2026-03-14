package csd.t6.backend.course;

import static csd.t6.jooq.public_.tables.Course.COURSE;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@Repository
public class CourseRepository extends BaseRepository<CourseRecord> {
  public CourseRepository(DSLContext dsl) {
    super(dsl, COURSE);
  }

  public CourseRecord create(String title, String description, UUID creatorId, UUID teamId) {
    return dsl.insertInto(COURSE).set(COURSE.TITLE, title).set(COURSE.DESCRIPTION, description)
        .set(COURSE.CREATOR_ID, creatorId).set(COURSE.TEAM_ID, teamId).returning().fetchOne();
  }

  public Optional<CourseRecord> findById(UUID id) {
    return this.findOneBy(COURSE.ID, id);
  }

  public List<CourseRecord> findAll() {
    return dsl.selectFrom(COURSE).fetch();
  }

  public CourseRecord update(UUID id, String title, String description, UUID teamId) {
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

    existing.store();
    return existing;
  }

  public void delete(UUID id) {
    dsl.deleteFrom(COURSE).where(COURSE.ID.eq(id)).execute();
  }
}