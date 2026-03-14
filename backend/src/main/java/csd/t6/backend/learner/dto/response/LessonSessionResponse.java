package csd.t6.backend.learner.dto.response;

import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;

import csd.t6.jooq.public_.tables.records.LearnerCourseRecord;
import jakarta.validation.constraints.NotNull;

public record LessonSessionResponse(@NotNull UUID courseId, @NotNull UUID lessonSessionId,
    @NotNull Map<String, Object> metadata) {
  public LessonSessionResponse(LearnerCourseRecord learnerCourse) {
    this(learnerCourse.getCourseId(), learnerCourse.getId(),
        new ObjectMapper().convertValue(learnerCourse.getMetadata(), Map.class));
  }
}
