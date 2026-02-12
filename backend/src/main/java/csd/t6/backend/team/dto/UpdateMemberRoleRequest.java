package csd.t6.backend.team.dto;

import csd.t6.jooq.enums.TeamRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UpdateMemberRoleRequest")
public record UpdateMemberRoleRequest(
    @NotNull TeamRole role) {
}