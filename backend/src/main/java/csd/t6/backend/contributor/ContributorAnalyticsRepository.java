package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.enums.LearnerCourseStatus.COMPLETED;
import static csd.t6.jooq.public_.tables.Course.COURSE;
import static csd.t6.jooq.public_.tables.LearnerCourse.LEARNER_COURSE;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.jooq.DSLContext;
import org.jooq.JSONB;
import org.jooq.Record2;
import org.jooq.Record3;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@Repository
public class ContributorAnalyticsRepository extends BaseRepository<CourseRecord> {
  public ContributorAnalyticsRepository(DSLContext dsl) {
    super(dsl, COURSE);
  }

  /**
   * Count total enrollments for courses created by the contributor
   */
  public int countEnrollmentsByContributor(UUID contributorId, OffsetDateTime since) {
    return Math.toIntExact(this.dsl.selectCount().from(LEARNER_COURSE).join(COURSE)
        .on(LEARNER_COURSE.COURSE_ID.eq(COURSE.ID)).where(COURSE.CREATOR_ID.eq(contributorId))
        .and(LEARNER_COURSE.ENROLLED_AT.greaterOrEqual(since.toLocalDateTime())).fetchOne(0, long.class));
  }

  /**
   * Count total completions for courses created by the contributor
   */
  public int countCompletionsByContributor(UUID contributorId, OffsetDateTime since) {
    return Math
        .toIntExact(this.dsl.selectCount().from(LEARNER_COURSE).join(COURSE).on(LEARNER_COURSE.COURSE_ID.eq(COURSE.ID))
            .where(COURSE.CREATOR_ID.eq(contributorId)).and(LEARNER_COURSE.STATUS.eq(COMPLETED))
            .and(LEARNER_COURSE.COMPLETED_AT.greaterOrEqual(since.toLocalDateTime())).fetchOne(0, long.class));
  }

  /**
   * Count active learners (enrolled with non-empty metadata and not completed)
   */
  public int countActiveLearnersByContributor(UUID contributorId, OffsetDateTime since) {
    return Math
        .toIntExact(this.dsl.selectCount().from(LEARNER_COURSE).join(COURSE).on(LEARNER_COURSE.COURSE_ID.eq(COURSE.ID))
            .where(COURSE.CREATOR_ID.eq(contributorId)).and(LEARNER_COURSE.ENROLLED_AT.greaterOrEqual(since.toLocalDateTime()))
            .and(LEARNER_COURSE.METADATA.ne(JSONB.valueOf("{}")))
            .and(LEARNER_COURSE.STATUS.ne(COMPLETED)).fetchOne(0, long.class));
  }

  /**
   * Get course update counts grouped by time bucket
   */
  public List<Record2<OffsetDateTime, Integer>> getCourseUpdateCountsByContributor(UUID contributorId,
      OffsetDateTime since) {
    return this.dsl.select(COURSE.UPDATED_AT, DSL.count()).from(COURSE).where(COURSE.CREATOR_ID.eq(contributorId))
        .and(COURSE.UPDATED_AT.greaterOrEqual(since)).groupBy(COURSE.UPDATED_AT).fetch();
  }

  /**
   * Get enrollment counts grouped by enrollment date
   */
  public List<Record3<LocalDateTime, Integer, Integer>> getEnrollmentCountsByDate(UUID contributorId,
      OffsetDateTime since) {
    return this.dsl.select(LEARNER_COURSE.ENROLLED_AT, DSL.count(), DSL.countDistinct(LEARNER_COURSE.USER_ID))
        .from(LEARNER_COURSE).join(COURSE).on(LEARNER_COURSE.COURSE_ID.eq(COURSE.ID))
        .where(COURSE.CREATOR_ID.eq(contributorId))
        .and(LEARNER_COURSE.ENROLLED_AT.greaterOrEqual(since.toLocalDateTime())).groupBy(LEARNER_COURSE.ENROLLED_AT)
        .fetch();
  }

  /**
   * Get all course IDs for a contributor
   */
  public List<UUID> getContributorCourseIds(UUID contributorId) {
    return this.dsl.select(COURSE.ID).from(COURSE).where(COURSE.CREATOR_ID.eq(contributorId)).fetch(COURSE.ID);
  }
}
