package csd.t6.backend.account.dto.request;

import jakarta.validation.constraints.NotNull;

import csd.t6.jooq.accounts.enums.Roles;

public record AccountRoleUpdateRequest(@NotNull Roles role) {
}
