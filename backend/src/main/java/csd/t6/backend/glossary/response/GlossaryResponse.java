package csd.t6.backend.glossary.response;

import jakarta.validation.constraints.NotNull;

public record GlossaryResponse(@NotNull String title, @NotNull String description, @NotNull String context,
    @NotNull String example, @NotNull String[] relationships) {}
