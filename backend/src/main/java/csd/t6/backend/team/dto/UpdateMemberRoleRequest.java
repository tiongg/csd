package csd.t6.backend.team.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Schema(name = "UpdateMemberRoleRequest")
public record UpdateMemberRoleRequest(
    @NotNull @Pattern(regexp = "OWNER|ADMIN|CONTRIBUTOR", message = "Role must be OWNER, ADMIN, or CONTRIBUTOR") String role) {
}