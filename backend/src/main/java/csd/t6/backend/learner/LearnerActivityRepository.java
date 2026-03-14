package csd.t6.backend.learner;

import static csd.t6.jooq.public_.tables.LearnerActivity.LEARNER_ACTIVITY;
import static csd.t6.jooq.public_.tables.LearnerCourse.LEARNER_COURSE;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.jooq.DSLContext;
import org.jooq.impl.SQLDataType;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.enums.LearnerActivityType;
import csd.t6.jooq.public_.enums.LearnerCourseStatus;
import csd.t6.jooq.public_.tables.records.LearnerActivityRecord;

@Repository
public class LearnerActivityRepository extends BaseRepository<LearnerActivityRecord> {

  public LearnerActivityRepository(DSLContext dsl) {
    super(dsl, LEARNER_ACTIVITY);
  }

  public LearnerActivityRecord insert(UUID userId, UUID courseId, LearnerActivityType activityType) {
    LearnerActivityRecord activity = this.dsl.newRecord(LEARNER_ACTIVITY);
    activity.setUserId(userId);
    activity.setCourseId(courseId);
    activity.setActivityType(activityType);
    return save(activity);
  }

  public List<Integer> getWeeklyCadence(UUID userId) {
    OffsetDateTime endDate = OffsetDateTime.now();
    OffsetDateTime startDate = endDate.minusDays(6);

    List<LocalDate> activeDates = this.dsl
        .selectDistinct(LEARNER_ACTIVITY.ACTIVITY_TIMESTAMP.cast(SQLDataType.LOCALDATE)).from(LEARNER_ACTIVITY)
        .where(LEARNER_ACTIVITY.USER_ID.eq(userId)).and(LEARNER_ACTIVITY.ACTIVITY_TIMESTAMP.greaterOrEqual(startDate))
        .and(LEARNER_ACTIVITY.ACTIVITY_TIMESTAMP.lessOrEqual(endDate)).fetch().map(record -> record.value1());

    List<Integer> weeklyCadence = new ArrayList<>();
    for (int i = 6; i >= 0; i--) {
      LocalDate date = endDate.minusDays(i).toLocalDate();
      weeklyCadence.add(activeDates.contains(date) ? 1 : 0);
    }

    return weeklyCadence;
  }

  public int countCompletedCourses(UUID userId) {
    return Math.toIntExact(this.dsl.selectCount().from(LEARNER_COURSE).where(LEARNER_COURSE.USER_ID.eq(userId))
        .and(LEARNER_COURSE.STATUS.eq(LearnerCourseStatus.COMPLETED)).fetchOne(0, int.class));
  }

  public int getCurrentStreak(UUID userId) {
    // Get all activities ordered by most recent, then deduplicate dates in Java
    List<LocalDate> allDates = this.dsl.select(LEARNER_ACTIVITY.ACTIVITY_TIMESTAMP.cast(SQLDataType.LOCALDATE))
        .from(LEARNER_ACTIVITY).where(LEARNER_ACTIVITY.USER_ID.eq(userId))
        .orderBy(LEARNER_ACTIVITY.ACTIVITY_TIMESTAMP.desc()).fetch().map(record -> record.value1());

    if (allDates.isEmpty()) {
      return 0;
    }

    // Deduplicate dates while preserving order
    List<LocalDate> activeDates = new ArrayList<>();
    LocalDate prevDate = null;
    for (LocalDate date : allDates) {
      if (!date.equals(prevDate)) {
        activeDates.add(date);
        prevDate = date;
      }
    }

    LocalDate today = LocalDate.now();
    LocalDate mostRecentActivity = activeDates.getFirst();

    // If most recent activity is not today or yesterday, streak is broken
    if (mostRecentActivity.isBefore(today.minusDays(1))) {
      return 0;
    }

    int streak = 1;
    LocalDate expectedDate = mostRecentActivity.minusDays(1);

    // Count consecutive days going backwards from most recent activity
    for (int i = 1; i < activeDates.size(); i++) {
      LocalDate activityDate = activeDates.get(i);
      if (activityDate.equals(expectedDate)) {
        streak++;
        expectedDate = expectedDate.minusDays(1);
      } else if (activityDate.isBefore(expectedDate)) {
        // Gap found, streak broken
        break;
      }
      // If activityDate is after expectedDate (duplicate or out of order), continue
    }

    return streak;
  }
}
