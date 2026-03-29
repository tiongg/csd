package csd.t6.backend.glossary.request;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record GlossaryUpdateRequest(@NotNull String name, @NotNull String description,
        @NotNull String usedInConversationExample, @NotNull String usedInContext,
        @NotNull List<@NotNull String> relationships) {}
