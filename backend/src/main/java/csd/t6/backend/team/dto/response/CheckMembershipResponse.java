package csd.t6.backend.team.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "CheckMembershipResponse")
public record CheckMembershipResponse(@NotNull Boolean isMember, @NotNull String role) {}