package csd.t6.backend.account.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// @formatter:off
public record AccountCreateRequest(
    @NotBlank 
    @Email 
    String email,

    @NotBlank 
    @Size(min = 3, max = 20) 
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    String username,

    @NotBlank
    @Size(min = 1, max = 50)
    @Pattern(regexp = "^(?=.*[A-Za-z])[A-Za-z ]+$", message = "Name can only contain letters and spaces")
    String realName,

    @NotBlank
    @Size(min = 6, max = 100)
    String password
) {}
// @formatter:on
