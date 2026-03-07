package csd.t6.backend.account.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// @formatter:off
public record AccountUpdateRequest(
    @Size(min = 3, max = 20) 
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username must contain only letters and numbers") 
    String username,

    @Size(min = 1)
    String realName) 
{}
// @formatter:on