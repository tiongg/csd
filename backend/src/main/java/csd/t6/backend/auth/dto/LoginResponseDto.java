package csd.t6.backend.auth.dto;

import csd.t6.backend.account.dto.AccountResponseDto;
import jakarta.validation.constraints.NotNull;

public record LoginResponseDto(@NotNull String accessToken, @NotNull AccountResponseDto account) {}
