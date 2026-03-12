package csd.t6.backend.course.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import csd.t6.jooq.public_.tables.records.CourseRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Course")
public record CourseResponse(@NotNull UUID id, @NotNull String title, String description, @NotNull UUID creatorId,
    @NotNull UUID teamId, @NotNull Boolean isPublished, @NotNull OffsetDateTime createdAt,
    @NotNull OffsetDateTime updatedAt, String reelUrl) {

  public CourseResponse(CourseRecord course, String reelUrl) {
    this(course.getId(), course.getTitle(), course.getDescription(), course.getCreatorId(), course.getTeamId(),
        course.getIsPublished(), course.getCreatedAt(), course.getUpdatedAt(), reelUrl);
  }
}