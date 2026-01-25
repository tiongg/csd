package csd.t6.backend.account.dto;

import java.util.UUID;

import csd.t6.jooq.accounts.tables.records.AccountRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Account")
public record AccountResponseDTO(@NotNull UUID id, @NotNull String email, @NotNull String username,
    @NotNull String realName) {
  public AccountResponseDTO(AccountRecord account) {
    this(account.getId(), account.getEmail(), account.getUsername(), account.getRealName());
  }
}