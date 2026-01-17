package csd.t6.backend.account.dto;

import jakarta.validation.constraints.NotNull;

public record AccountCreateRequest(@NotNull String email) {

}
