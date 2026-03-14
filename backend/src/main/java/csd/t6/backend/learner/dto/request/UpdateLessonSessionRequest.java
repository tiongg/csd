package csd.t6.backend.learner.dto.request;

import java.util.Map;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Update lesson session request")
public record UpdateLessonSessionRequest(
    @Schema(type = "object", additionalProperties = Schema.AdditionalPropertiesValue.TRUE) @NotNull Map<String, Object> metadata) {

}
