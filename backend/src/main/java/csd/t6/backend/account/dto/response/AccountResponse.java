package csd.t6.backend.account.dto.response;

import java.util.UUID;

import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Account")
public record AccountResponse(@NotNull UUID id, @NotNull String email, @NotNull String username, String realname,
    @NotNull Roles role) {
  public AccountResponse(AccountRecord account) {
    this(account.getId(), account.getEmail(), account.getUsername(), account.getRealName(), account.getUserRole());
  }
}