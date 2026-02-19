package csd.t6.backend.team.dto.request;

import csd.t6.jooq.public_.enums.TeamRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UpdateMemberRoleRequest")
public record UpdateMemberRoleRequest(@NotNull TeamRole role) {}