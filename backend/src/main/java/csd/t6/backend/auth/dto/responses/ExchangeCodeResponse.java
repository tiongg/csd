package csd.t6.backend.auth.dto.responses;

import jakarta.validation.constraints.NotBlank;

public record ExchangeCodeResponse(@NotBlank String code) {}
