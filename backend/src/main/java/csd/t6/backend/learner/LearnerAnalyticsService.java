package csd.t6.backend.learner;

import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.learner.dto.response.LearnerAnalyticsResponse;
import csd.t6.jooq.public_.enums.LearnerActivityType;

@Service
public class LearnerAnalyticsService {
  private final LearnerActivityRepository learnerActivityRepository;

  public LearnerAnalyticsService(LearnerActivityRepository learnerActivityRepository) {
    this.learnerActivityRepository = learnerActivityRepository;
  }

  public void logActivity(UUID userId, UUID courseId, LearnerActivityType activityType) {
    this.learnerActivityRepository.insert(userId, courseId, activityType);
  }

  public LearnerAnalyticsResponse getAnalytics(UUID userId) {
    var weeklyCadence = this.learnerActivityRepository.getWeeklyCadence(userId);
    int activeDays = weeklyCadence.stream().mapToInt(Integer::intValue).sum();
    int focusScore = (int) Math.round((activeDays / 7.0) * 100);
    int completedCoursesCount = this.learnerActivityRepository.countCompletedCourses(userId);
    int currentStreak = this.learnerActivityRepository.getCurrentStreak(userId);
    return new LearnerAnalyticsResponse(weeklyCadence, activeDays, focusScore, completedCoursesCount, currentStreak);
  }
}
