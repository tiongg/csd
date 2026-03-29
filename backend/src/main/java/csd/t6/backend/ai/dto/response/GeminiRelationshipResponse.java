package csd.t6.backend.ai.dto.response;

import java.util.List;

import csd.t6.backend.glossary.request.GlossaryUpdateRequest;
import jakarta.validation.constraints.NotNull;

public record GeminiRelationshipResponse(@NotNull List<@NotNull GlossaryUpdateRequest> tags) {}
