package csd.t6.backend.auth.oauth.dto;

import jakarta.validation.constraints.NotBlank;

public record OAuth2CallbackRequest(@NotBlank String code, @NotBlank String redirectUri) {}
