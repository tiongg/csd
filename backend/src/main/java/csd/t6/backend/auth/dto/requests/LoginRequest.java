package csd.t6.backend.auth.dto.requests;

import jakarta.validation.constraints.NotNull;

public record LoginRequest(@NotNull String usernameOrEmail, @NotNull String password) {}
