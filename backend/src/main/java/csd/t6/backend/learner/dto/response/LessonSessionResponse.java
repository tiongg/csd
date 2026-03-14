package csd.t6.backend.learner.dto.response;

import java.util.Map;
import java.util.UUID;

import org.jooq.JSONB;

import com.fasterxml.jackson.databind.ObjectMapper;

import csd.t6.jooq.public_.tables.records.LearnerCourseRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Lesson session response")
public record LessonSessionResponse(@NotNull UUID courseId, @NotNull UUID lessonSessionId,
    @Schema(type = "object", additionalProperties = Schema.AdditionalPropertiesValue.TRUE) @NotNull Map<String, Object> metadata) {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  public LessonSessionResponse(LearnerCourseRecord learnerCourse) {
    this(learnerCourse.getCourseId(), learnerCourse.getId(), extractMetadata(learnerCourse.getMetadata()));
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
    if (data instanceof String) {
      try {
        return OBJECT_MAPPER.readValue((String) data, Map.class);
      } catch (Exception e) {
        return Map.of();
      }
    }
    return Map.of();
  }
}
