package csd.t6.backend.learner;

import static csd.t6.jooq.public_.tables.LearnerCourse.LEARNER_COURSE;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.jooq.JSONB;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.exceptions.ForbiddenException;
import csd.t6.backend.learner.dto.response.LessonSessionFullResponse;
import csd.t6.backend.learner.dto.response.UserEnrolledLessonsResponse;
import csd.t6.jooq.public_.enums.LearnerCourseStatus;
import csd.t6.jooq.public_.tables.records.LearnerCourseRecord;

@Service
public class LearnerLessonService {
  private final LearnerCourseRepository learnerCourseRepository;

  public LearnerLessonService(LearnerCourseRepository learnerCourseRepository) {
    this.learnerCourseRepository = learnerCourseRepository;
  }

  public LearnerCourseRecord enrollToCourse(UUID courseId, UUID userId) {
    if (this.learnerCourseRepository.isEnrolledToCourse(userId, courseId)) {
      throw new BadRequestException("Already enrolled to this course");
    }

    return this.learnerCourseRepository.insert(userId, courseId);
  }

  public LearnerCourseRecord updateLessonSessionMetadata(UUID lessonSessionId, UUID userId,
      Map<String, Object> metadata) {
    LearnerCourseRecord learnerCourse = this.learnerCourseRepository.findOneBy(LEARNER_COURSE.ID, lessonSessionId)
        .orElseThrow(() -> new RuntimeException("Learner course not found"));
    if (!learnerCourse.getUserId().equals(userId)) {
      throw new ForbiddenException("Unauthorized");
    }
    ObjectMapper objectMapper = new ObjectMapper();
    try {
      learnerCourse.setMetadata(JSONB.valueOf(objectMapper.writeValueAsString(metadata)));
    } catch (Exception e) {
      throw new BadRequestException("Failed to serialize metadata");
    }
    return this.learnerCourseRepository.save(learnerCourse);
  }

  public UserEnrolledLessonsResponse getEnrolledLessons(UUID userId) {
    return new UserEnrolledLessonsResponse(
        this.learnerCourseRepository.getLearnerEnrolled(userId).stream().map(LessonSessionFullResponse::new).toList());
  }

  public void dropCourse(UUID lessonSessionId) {
    int deleted = this.learnerCourseRepository.delete(LEARNER_COURSE.ID, lessonSessionId);
    if (deleted == 0) {
      throw new BadRequestException("Failed to drop course");
    }
  }

  public LearnerCourseRecord completeLesson(UUID lessonId) {
    LearnerCourseRecord learnerCourse = this.learnerCourseRepository.findOneBy(LEARNER_COURSE.ID, lessonId)
        .orElseThrow(() -> new RuntimeException("Learner course not found"));
    learnerCourse.setStatus(LearnerCourseStatus.COMPLETED);
    learnerCourse.setCompletedAt(LocalDateTime.now());
    return this.learnerCourseRepository.save(learnerCourse);
  }
}
