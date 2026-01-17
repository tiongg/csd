package csd.t6.backend.account;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.account.dto.AccountCreateRequest;
import csd.t6.backend.account.dto.AccountResponseDTO;

@RestController
@RequestMapping("/api/account")
public class AccountController {
  private final AccountService accountService;

  public AccountController(AccountService accountService) {
    this.accountService = accountService;
  }

  @GetMapping("/")
  public List<AccountResponseDTO> getAll() {
    return accountService.getAllAccounts().stream().map(record -> new AccountResponseDTO(record)).toList();
  }

  @PostMapping("/")
  public AccountResponseDTO createAccount(@RequestBody AccountCreateRequest entity) {
    return new AccountResponseDTO(accountService.createNewAccount(entity.email()));
  }

  @DeleteMapping("/{accountId}")
  public void deleteAccount(@PathVariable String accountId) {
    accountService.deleteAccount(UUID.fromString(accountId));
  }
}
