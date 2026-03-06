package csd.t6.backend.auth.dto.response;

import java.util.List;

import csd.t6.backend.account.dto.response.AccountResponse;
import jakarta.validation.constraints.NotNull;

public record SelfResponse(@NotNull AccountResponse account, @NotNull List<String> preferences) {

}
