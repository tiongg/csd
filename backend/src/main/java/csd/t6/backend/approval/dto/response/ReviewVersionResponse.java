package csd.t6.backend.approval.dto.response;

import csd.t6.backend.course.dto.response.CourseResponse;
import jakarta.validation.constraints.NotNull;

public record ReviewVersionResponse(@NotNull String downloadUrl, @NotNull ContentVersionResponse contentVersion,
    @NotNull CourseResponse course) {}
