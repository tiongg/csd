package csd.t6.backend.auth.dto;

import jakarta.validation.constraints.NotNull;

public record LoginDto(
    @NotNull String usernameOrEmail,
    @NotNull String password) {
}
