package csd.t6.backend.team.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(name = "TeamUpdateRequest")
public record TeamUpdateRequest(
    @Size(min = 3, max = 100, message = "Team name must be between 3 and 100 characters") String name,

    @Size(max = 500, message = "Description must not exceed 500 characters") String description) {
}