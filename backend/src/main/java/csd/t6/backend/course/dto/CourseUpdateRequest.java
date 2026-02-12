package csd.t6.backend.course.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(name = "CourseUpdateRequest")
public record CourseUpdateRequest(
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters") String title,

    @Size(max = 1000, message = "Description must not exceed 1000 characters") String description,

    UUID teamId,

    Boolean isPublished) {
}