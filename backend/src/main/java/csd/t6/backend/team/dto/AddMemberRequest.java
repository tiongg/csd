package csd.t6.backend.team.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "AddMemberRequest")
public record AddMemberRequest(@NotNull String username) {}