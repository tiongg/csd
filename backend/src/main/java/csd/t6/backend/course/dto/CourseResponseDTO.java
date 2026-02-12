package csd.t6.backend.course.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Course")
public record CourseResponseDTO(
    @NotNull UUID id,
    @NotNull String title,
    String description,
    @NotNull UUID creatorId,
    UUID teamId,
    @NotNull Boolean isPublished,
    @NotNull OffsetDateTime createdAt,
    @NotNull OffsetDateTime updatedAt) {
}