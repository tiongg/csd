package csd.t6.backend.auth.dto.request;

import jakarta.validation.constraints.NotNull;

public record LoginRequest(@NotNull String usernameOrEmail, @NotNull String password) {}
