package csd.t6.backend.contributor.dto.response;

import jakarta.validation.constraints.NotNull;

public record EnrollmentTrendBucket(
    @NotNull String label,
    @NotNull Integer value,
    @NotNull Integer attempts
) {}
