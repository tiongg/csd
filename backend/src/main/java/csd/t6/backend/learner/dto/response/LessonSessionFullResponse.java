package csd.t6.backend.learner.dto.response;

import java.util.Map;
import java.util.UUID;

import org.jooq.JSONB;

import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.learner.util.LessonCourseRecord;
import jakarta.validation.constraints.NotNull;

public record LessonSessionFullResponse(@NotNull UUID lessonSessionId, @NotNull Map<String, Object> metadata,
    @NotNull CourseResponse course) {

  public LessonSessionFullResponse(LessonCourseRecord lessonCourseRecord) {
    this(lessonCourseRecord.learnerCourseRecord().getId(),
        extractMetadata(lessonCourseRecord.learnerCourseRecord().getMetadata()),
        new CourseResponse(lessonCourseRecord.courseRecord(), null));
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> extractMetadata(JSONB jsonb) {
    if (jsonb == null || jsonb.data() == null) {
      return Map.of();
    }
    Object data = jsonb.data();
    if (data instanceof Map) {
      return (Map<String, Object>) data;
    }
    return Map.of();
  }
}
