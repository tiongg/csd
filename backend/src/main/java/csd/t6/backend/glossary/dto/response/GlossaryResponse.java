package csd.t6.backend.glossary.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "GlossaryItem", description = "Response object for a glossary term")
public record GlossaryResponse(@NotNull String title, @NotNull String description, @NotNull String context,
        @NotNull String example, @NotNull String[] relationships) {}
