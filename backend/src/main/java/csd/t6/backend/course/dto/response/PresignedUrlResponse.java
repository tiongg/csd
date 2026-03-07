package csd.t6.backend.course.dto.response;

import jakarta.validation.constraints.NotNull;

public record PresignedUrlResponse(@NotNull String url, @NotNull String key) {}
