package csd.t6.backend.course.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import csd.t6.jooq.public_.tables.records.CourseRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Course")
public record CourseResponse(@NotNull UUID id, @NotNull String title, String description, @NotNull UUID creatorId,
    String creatorUsername, @NotNull UUID teamId, @NotNull OffsetDateTime createdAt, @NotNull OffsetDateTime updatedAt,
    String imageUrl, List<String> tags) {

  public CourseResponse(CourseRecord course, String imageUrl, List<String> tags) {
    this(course, imageUrl, tags, null);
  }

  public CourseResponse(CourseRecord course, String imageUrl, List<String> tags, String creatorUsername) {
    this(course.getId(), course.getTitle(), course.getDescription(), course.getCreatorId(), creatorUsername,
        course.getTeamId(), course.getCreatedAt(), course.getUpdatedAt(), imageUrl, tags);
  }
}
