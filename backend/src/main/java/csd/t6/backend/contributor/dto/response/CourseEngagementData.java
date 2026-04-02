package csd.t6.backend.contributor.dto.response;

import jakarta.validation.constraints.NotNull;

public record CourseEngagementData(
    @NotNull Integer enrolled,
    @NotNull Integer active,
    @NotNull Integer completed
) {}
