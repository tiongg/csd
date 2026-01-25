package csd.t6.backend.account.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// @formatter:off
public record AccountCreateRequest(
    @NotNull 
    @Email 
    String email,

    @NotNull 
    @Size(min = 3, max = 20) 
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username must contain only letters and numbers") 
    String username,
    
    @NotNull 
    String password
) {}
// @formatter:on