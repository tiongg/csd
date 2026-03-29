package csd.t6.backend.learner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.learner.dto.response.LearnerAnalyticsResponse;
import csd.t6.jooq.public_.enums.LearnerActivityType;
import csd.t6.jooq.public_.tables.records.LearnerActivityRecord;

@ExtendWith(MockitoExtension.class)
class LearnerAnalyticsServiceTest {

  @Mock
  private LearnerActivityRepository learnerActivityRepository;

  @InjectMocks
  private LearnerAnalyticsService learnerAnalyticsService;

  private UUID userId;
  private UUID courseId;

  @BeforeEach
  void setUp() {
    userId = UUID.randomUUID();
    courseId = UUID.randomUUID();
  }

  // --- logActivity ---

  @Test
  @DisplayName("Should log learner activity")
  void shouldLogLearnerActivity() {
    when(learnerActivityRepository.insert(userId, courseId, LearnerActivityType.COURSE_ENROLLED))
        .thenReturn(mock(LearnerActivityRecord.class));

    learnerAnalyticsService.logActivity(userId, courseId, LearnerActivityType.COURSE_ENROLLED);

    verify(learnerActivityRepository).insert(userId, courseId, LearnerActivityType.COURSE_ENROLLED);
  }

  @Test
  @DisplayName("Should log different activity types")
  void shouldLogDifferentActivityTypes() {
    learnerAnalyticsService.logActivity(userId, courseId, LearnerActivityType.COURSE_COMPLETED);
    learnerAnalyticsService.logActivity(userId, courseId, LearnerActivityType.METADATA_UPDATED);

    verify(learnerActivityRepository).insert(userId, courseId, LearnerActivityType.COURSE_COMPLETED);
    verify(learnerActivityRepository).insert(userId, courseId, LearnerActivityType.METADATA_UPDATED);
  }

  // --- getAnalytics ---

  @Test
  @DisplayName("Should return analytics with correct calculations")
  void shouldReturnAnalyticsWithCorrectCalculations() {
    List<Integer> weeklyCadence = List.of(1, 0, 1, 1, 0, 1, 0);
    int expectedActiveDays = 4; // sum of weeklyCadence
    int expectedFocusScore = (int) Math.round((expectedActiveDays / 7.0) * 100);

    when(learnerActivityRepository.getWeeklyCadence(userId)).thenReturn(weeklyCadence);
    when(learnerActivityRepository.countCompletedCourses(userId)).thenReturn(3);
    when(learnerActivityRepository.getCurrentStreak(userId)).thenReturn(7);

    LearnerAnalyticsResponse result = learnerAnalyticsService.getAnalytics(userId);

    assertThat(result).isNotNull();
    assertThat(result.weeklyCadence()).isEqualTo(weeklyCadence);
    assertThat(result.activeDays()).isEqualTo(expectedActiveDays);
    assertThat(result.focusScore()).isEqualTo(expectedFocusScore);
    assertThat(result.completedCoursesCount()).isEqualTo(3);
    assertThat(result.currentStreak()).isEqualTo(7);
  }

  @Test
  @DisplayName("Should calculate focus score as 0 when no active days")
  void shouldCalculateFocusScoreAsZeroWhenNoActiveDays() {
    when(learnerActivityRepository.getWeeklyCadence(userId)).thenReturn(List.of(0, 0, 0, 0, 0, 0, 0));
    when(learnerActivityRepository.countCompletedCourses(userId)).thenReturn(0);
    when(learnerActivityRepository.getCurrentStreak(userId)).thenReturn(0);

    LearnerAnalyticsResponse result = learnerAnalyticsService.getAnalytics(userId);

    assertThat(result.focusScore()).isEqualTo(0);
  }

  @Test
  @DisplayName("Should calculate focus score as 100 when all 7 days active")
  void shouldCalculateFocusScoreAs100WhenAllDaysActive() {
    when(learnerActivityRepository.getWeeklyCadence(userId)).thenReturn(List.of(1, 1, 1, 1, 1, 1, 1));
    when(learnerActivityRepository.countCompletedCourses(userId)).thenReturn(5);
    when(learnerActivityRepository.getCurrentStreak(userId)).thenReturn(7);

    LearnerAnalyticsResponse result = learnerAnalyticsService.getAnalytics(userId);

    assertThat(result.focusScore()).isEqualTo(100);
  }

  @Test
  @DisplayName("Should return 0 for current streak when no activities")
  void shouldReturnZeroStreakWhenNoActivities() {
    when(learnerActivityRepository.getWeeklyCadence(userId)).thenReturn(List.of(0, 0, 0, 0, 0, 0, 0));
    when(learnerActivityRepository.countCompletedCourses(userId)).thenReturn(0);
    when(learnerActivityRepository.getCurrentStreak(userId)).thenReturn(0);

    LearnerAnalyticsResponse result = learnerAnalyticsService.getAnalytics(userId);

    assertThat(result.currentStreak()).isEqualTo(0);
  }

  @Test
  @DisplayName("Should handle partial weekly cadence")
  void shouldHandlePartialWeeklyCadence() {
    List<Integer> partialCadence = List.of(1, 1, 0, 0, 0);
    int expectedActiveDays = 2;
    int expectedFocusScore = (int) Math.round((expectedActiveDays / 7.0) * 100); // 28 or 29

    when(learnerActivityRepository.getWeeklyCadence(userId)).thenReturn(partialCadence);
    when(learnerActivityRepository.countCompletedCourses(userId)).thenReturn(1);
    when(learnerActivityRepository.getCurrentStreak(userId)).thenReturn(2);

    LearnerAnalyticsResponse result = learnerAnalyticsService.getAnalytics(userId);

    assertThat(result.weeklyCadence()).isEqualTo(partialCadence);
    assertThat(result.activeDays()).isEqualTo(expectedActiveDays);
    assertThat(result.focusScore()).isEqualTo(expectedFocusScore);
  }
}
