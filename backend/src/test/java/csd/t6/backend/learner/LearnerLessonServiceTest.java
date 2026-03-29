package csd.t6.backend.learner;

import static csd.t6.jooq.public_.tables.LearnerCourse.LEARNER_COURSE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.exceptions.ForbiddenException;
import csd.t6.backend.learner.dto.response.LessonSessionFullResponse;
import csd.t6.backend.learner.dto.response.UserEnrolledLessonsResponse;
import csd.t6.backend.learner.util.LessonCourseRecord;
import csd.t6.jooq.public_.enums.LearnerActivityType;
import csd.t6.jooq.public_.enums.LearnerCourseStatus;
import csd.t6.jooq.public_.tables.records.LearnerCourseRecord;

@ExtendWith(MockitoExtension.class)
class LearnerLessonServiceTest {

  @Mock
  private LearnerCourseRepository learnerCourseRepository;

  @Mock
  private LearnerAnalyticsService learnerAnalyticsService;

  @InjectMocks
  private LearnerLessonService learnerLessonService;

  private UUID userId;
  private UUID courseId;
  private UUID lessonSessionId;
  private LearnerCourseRecord mockLearnerCourse;

  @BeforeEach
  void setUp() {
    userId = UUID.randomUUID();
    courseId = UUID.randomUUID();
    lessonSessionId = UUID.randomUUID();

    mockLearnerCourse = mock(LearnerCourseRecord.class);
    lenient().when(mockLearnerCourse.getId()).thenReturn(lessonSessionId);
    lenient().when(mockLearnerCourse.getUserId()).thenReturn(userId);
    lenient().when(mockLearnerCourse.getCourseId()).thenReturn(courseId);
    lenient().when(mockLearnerCourse.getStatus()).thenReturn(LearnerCourseStatus.IN_PROGRESS);
  }

  // --- enrollToCourse ---

  @Test
  @DisplayName("Should enroll user to course successfully")
  void shouldEnrollUserToCourse() {
    when(learnerCourseRepository.isEnrolledToCourse(userId, courseId)).thenReturn(false);
    when(learnerCourseRepository.insert(userId, courseId)).thenReturn(mockLearnerCourse);

    LearnerCourseRecord result = learnerLessonService.enrollToCourse(courseId, userId);

    assertThat(result).isNotNull();
    verify(learnerAnalyticsService).logActivity(userId, courseId, LearnerActivityType.COURSE_ENROLLED);
  }

  @Test
  @DisplayName("Should throw when user is already enrolled")
  void shouldThrowWhenAlreadyEnrolled() {
    when(learnerCourseRepository.isEnrolledToCourse(userId, courseId)).thenReturn(true);

    assertThatThrownBy(() -> learnerLessonService.enrollToCourse(courseId, userId))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Already enrolled");
  }

  // --- updateLessonSessionMetadata ---

  @Test
  @DisplayName("Should update lesson session metadata successfully")
  void shouldUpdateLessonSessionMetadata() {
    Map<String, Object> metadata = Map.of("progress", 50, "lastPosition", 120);
    when(learnerCourseRepository.findOneBy(eq(LEARNER_COURSE.ID), eq(lessonSessionId)))
        .thenReturn(java.util.Optional.of(mockLearnerCourse));
    when(learnerCourseRepository.save(mockLearnerCourse)).thenReturn(mockLearnerCourse);

    LearnerCourseRecord result = learnerLessonService.updateLessonSessionMetadata(lessonSessionId, userId, metadata);

    assertThat(result).isNotNull();
    verify(learnerAnalyticsService).logActivity(userId, courseId, LearnerActivityType.METADATA_UPDATED);
  }

  @Test
  @DisplayName("Should throw when learner course not found for metadata update")
  void shouldThrowWhenLearnerCourseNotFoundForMetadata() {
    Map<String, Object> metadata = Map.of("progress", 50);
    when(learnerCourseRepository.findOneBy(eq(LEARNER_COURSE.ID), eq(lessonSessionId)))
        .thenReturn(java.util.Optional.empty());

    assertThatThrownBy(() -> learnerLessonService.updateLessonSessionMetadata(lessonSessionId, userId, metadata))
        .isInstanceOf(RuntimeException.class).hasMessageContaining("Learner course not found");
  }

  @Test
  @DisplayName("Should throw when user is not authorized to update metadata")
  void shouldThrowWhenNotAuthorizedToUpdateMetadata() {
    UUID otherUserId = UUID.randomUUID();
    lenient().when(mockLearnerCourse.getUserId()).thenReturn(otherUserId);
    Map<String, Object> metadata = Map.of("progress", 50);
    when(learnerCourseRepository.findOneBy(eq(LEARNER_COURSE.ID), eq(lessonSessionId)))
        .thenReturn(java.util.Optional.of(mockLearnerCourse));

    assertThatThrownBy(() -> learnerLessonService.updateLessonSessionMetadata(lessonSessionId, userId, metadata))
        .isInstanceOf(ForbiddenException.class).hasMessageContaining("Unauthorized");
  }

  // --- getEnrolledLessons ---

  @Test
  @DisplayName("Should get enrolled lessons for user")
  void shouldGetEnrolledLessons() {
    LessonCourseRecord lessonCourseRecord = new LessonCourseRecord(mockLearnerCourse, mock(csd.t6.jooq.public_.tables.records.CourseRecord.class));
    when(learnerCourseRepository.getLearnerEnrolled(userId)).thenReturn(List.of(lessonCourseRecord));

    UserEnrolledLessonsResponse result = learnerLessonService.getEnrolledLessons(userId);

    assertThat(result).isNotNull();
    assertThat(result.enrolledLessons()).hasSize(1);
  }

  @Test
  @DisplayName("Should return empty list when no enrolled lessons")
  void shouldReturnEmptyListWhenNoEnrolledLessons() {
    when(learnerCourseRepository.getLearnerEnrolled(userId)).thenReturn(List.of());

    UserEnrolledLessonsResponse result = learnerLessonService.getEnrolledLessons(userId);

    assertThat(result).isNotNull();
    assertThat(result.enrolledLessons()).isEmpty();
  }

  // --- dropCourse ---

  @Test
  @DisplayName("Should drop course successfully")
  void shouldDropCourse() {
    when(learnerCourseRepository.delete(eq(LEARNER_COURSE.ID), eq(lessonSessionId))).thenReturn(1);

    learnerLessonService.dropCourse(lessonSessionId);

    verify(learnerCourseRepository).delete(LEARNER_COURSE.ID, lessonSessionId);
  }

  @Test
  @DisplayName("Should throw when drop course fails")
  void shouldThrowWhenDropCourseFails() {
    when(learnerCourseRepository.delete(eq(LEARNER_COURSE.ID), eq(lessonSessionId))).thenReturn(0);

    assertThatThrownBy(() -> learnerLessonService.dropCourse(lessonSessionId))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Failed to drop course");
  }

  // --- completeLesson ---

  @Test
  @DisplayName("Should complete lesson successfully")
  void shouldCompleteLesson() {
    when(learnerCourseRepository.findOneBy(eq(LEARNER_COURSE.ID), eq(lessonSessionId)))
        .thenReturn(java.util.Optional.of(mockLearnerCourse));
    when(learnerCourseRepository.save(mockLearnerCourse)).thenReturn(mockLearnerCourse);

    LearnerCourseRecord result = learnerLessonService.completeLesson(lessonSessionId);

    assertThat(result).isNotNull();
    assertThat(result.getStatus()).isEqualTo(LearnerCourseStatus.COMPLETED);
    assertThat(result.getCompletedAt()).isNotNull();
    verify(learnerAnalyticsService).logActivity(userId, courseId, LearnerActivityType.COURSE_COMPLETED);
  }

  @Test
  @DisplayName("Should throw when lesson not found for completion")
  void shouldThrowWhenLessonNotFoundForCompletion() {
    when(learnerCourseRepository.findOneBy(eq(LEARNER_COURSE.ID), eq(lessonSessionId)))
        .thenReturn(java.util.Optional.empty());

    assertThatThrownBy(() -> learnerLessonService.completeLesson(lessonSessionId))
        .isInstanceOf(RuntimeException.class).hasMessageContaining("Learner course not found");
  }
}
