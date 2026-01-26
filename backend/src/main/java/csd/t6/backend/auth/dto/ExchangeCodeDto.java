package csd.t6.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ExchangeCodeDto(@NotBlank String code) {}
