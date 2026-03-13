package csd.t6.backend.contributor.dto.response;

import jakarta.validation.constraints.NotNull;

public record ImageUploadResponse(@NotNull String url, @NotNull String key, @NotNull String publicUrl) {}
