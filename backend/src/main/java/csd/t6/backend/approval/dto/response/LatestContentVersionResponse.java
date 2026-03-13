package csd.t6.backend.approval.dto.response;

import csd.t6.backend.course.dto.response.CourseResponse;
import jakarta.validation.constraints.NotNull;

public record LatestContentVersionResponse(@NotNull String downloadUrl, @NotNull CourseResponse course) {}
