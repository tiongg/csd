package csd.t6.backend.team.dto;

import java.util.UUID;

import csd.t6.jooq.enums.TeamRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "AddMemberRequest")
public record AddMemberRequest(
    @NotNull UUID accountId,
    @NotNull TeamRole teamRole) {
}