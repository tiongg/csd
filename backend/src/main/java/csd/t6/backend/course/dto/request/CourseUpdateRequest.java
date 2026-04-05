package csd.t6.backend.course.dto.request;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(name = "CourseUpdateRequest")
public record CourseUpdateRequest(
        @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters") String title,
        @Size(max = 1000, message = "Description must not exceed 1000 characters") String description, String category,
        @Size(max = 8, message = "Maximum 8 tags allowed") List<@Size(max = 50, message = "Tag title must not exceed 50 characters") String> tags) {}