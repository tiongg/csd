package csd.t6.backend.account.dto.request;

import csd.t6.jooq.accounts.enums.Roles;
import jakarta.validation.constraints.NotNull;

public record AccountRoleUpdateRequest(@NotNull Roles newRole) {}
