package csd.t6.backend.auth.dto.response;

import csd.t6.backend.account.dto.response.AccountResponse;
import jakarta.validation.constraints.NotNull;

public record LoginResponse(@NotNull String accessToken, @NotNull AccountResponse account) {}
