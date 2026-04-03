package csd.t6.backend.learner.dto.response;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import org.jooq.JSONB;

import com.fasterxml.jackson.databind.ObjectMapper;

import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.learner.util.LessonCourseRecord;
import csd.t6.jooq.public_.enums.LearnerCourseStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Full lesson session response")
public record LessonSessionFullResponse(@NotNull UUID lessonSessionId, @NotNull LearnerCourseStatus status,
    @Schema(type = "object", additionalProperties = Schema.AdditionalPropertiesValue.TRUE) @NotNull Map<String, Object> metadata,
    @NotNull CourseResponse course) {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  public LessonSessionFullResponse(LessonCourseRecord lessonCourseRecord) {
    this(lessonCourseRecord, null);
  }

  public LessonSessionFullResponse(LessonCourseRecord lessonCourseRecord, String creatorUsername) {
    this(lessonCourseRecord.learnerCourseRecord().getId(), lessonCourseRecord.learnerCourseRecord().getStatus(),
        extractMetadata(lessonCourseRecord.learnerCourseRecord().getMetadata()),
        new CourseResponse(lessonCourseRecord.courseRecord(), null, Collections.emptyList(), creatorUsername));
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
