package csd.t6.backend.utils.dto;

import jakarta.validation.constraints.NotNull;

public record PresignedUrlResponse(@NotNull String url, @NotNull String key) {}
