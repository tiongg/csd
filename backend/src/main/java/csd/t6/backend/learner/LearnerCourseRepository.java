package csd.t6.backend.learner;

import static csd.t6.jooq.public_.tables.Course.COURSE;
import static csd.t6.jooq.public_.tables.LearnerCourse.LEARNER_COURSE;

import java.util.List;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.learner.util.LessonCourseRecord;
import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.tables.records.LearnerCourseRecord;

@Repository
public class LearnerCourseRepository extends BaseRepository<LearnerCourseRecord> {
  public LearnerCourseRepository(DSLContext dsl) {
    super(dsl, LEARNER_COURSE);
  }

  public boolean isEnrolledToCourse(UUID userId, UUID courseId) {
    return this.dsl.selectFrom(LEARNER_COURSE)
        .where(LEARNER_COURSE.USER_ID.eq(userId).and(LEARNER_COURSE.COURSE_ID.eq(courseId))).fetchOptional()
        .isPresent();
  }

  public List<LessonCourseRecord> getLearnerEnrolled(UUID userId) {
    return this.dsl.select(LEARNER_COURSE, COURSE).from(LEARNER_COURSE).join(COURSE)
        .on(LEARNER_COURSE.COURSE_ID.eq(COURSE.ID)).where(LEARNER_COURSE.USER_ID.eq(userId)).fetch()
        .map(r -> new LessonCourseRecord(r.value1().into(LEARNER_COURSE), r.value2().into(COURSE)));
  }

  public LearnerCourseRecord insert(UUID userId, UUID courseId) {
    LearnerCourseRecord learnerCourse = this.dsl.newRecord(LEARNER_COURSE);
    learnerCourse.setUserId(userId);
    learnerCourse.setCourseId(courseId);
    return this.save(learnerCourse);
  }
}
