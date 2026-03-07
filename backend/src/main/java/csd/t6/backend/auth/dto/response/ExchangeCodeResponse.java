package csd.t6.backend.auth.dto.response;

import jakarta.validation.constraints.NotBlank;

public record ExchangeCodeResponse(@NotBlank String code) {}
