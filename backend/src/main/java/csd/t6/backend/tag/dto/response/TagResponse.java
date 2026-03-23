package csd.t6.backend.tag.dto.response;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Tag")
public record TagResponse(
    @NotNull UUID id,
    @NotNull String title,
    String description) {
}
