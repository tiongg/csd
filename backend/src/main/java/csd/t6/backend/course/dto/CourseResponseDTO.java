package csd.t6.backend.course.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import csd.t6.jooq.public_.tables.records.CourseRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Course")
public record CourseResponseDTO(@NotNull UUID id, @NotNull String title, String description, @NotNull UUID creatorId,
    @NotNull UUID teamId, @NotNull Boolean isPublished, @NotNull OffsetDateTime createdAt,
    @NotNull OffsetDateTime updatedAt) {

  public CourseResponseDTO(CourseRecord course) {
    this(course.getId(), course.getTitle(), course.getDescription(), course.getCreatorId(), course.getTeamId(),
        course.getIsPublished(), course.getCreatedAt(), course.getUpdatedAt());
  }
}