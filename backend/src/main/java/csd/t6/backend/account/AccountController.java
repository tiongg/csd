package csd.t6.backend.account;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.account.dto.AccountCreateRequest;
import csd.t6.backend.account.dto.AccountResponseDTO;
import csd.t6.backend.account.dto.AccountUpdateRequest;
import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.decorators.auth.PublicDecorator;
import csd.t6.backend.decorators.responses.BadRequestResponse;
import csd.t6.backend.decorators.responses.CreatedResponse;
import csd.t6.backend.decorators.responses.NoContentResponse;
import csd.t6.backend.decorators.responses.OkResponse;
import jakarta.validation.Valid;

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
  @PublicDecorator()
  @CreatedResponse()
  @BadRequestResponse()
  public AccountResponseDTO createAccount(@RequestBody @Valid AccountCreateRequest createDTO) {
    return new AccountResponseDTO(accountService.createNewAccount(createDTO));
  }

  @DeleteMapping("/{accountId}")
  @BadRequestResponse()
  @NoContentResponse()
  public void deleteAccount(@PathVariable String accountId) {
    accountService.deleteAccount(UUID.fromString(accountId));
  }

  @PatchMapping("/")
  @BadRequestResponse()
  @OkResponse()
  public AccountResponseDTO updateAccount(@AuthenticationPrincipal AuthUserDetails user,
      @RequestBody @Valid AccountUpdateRequest updateDTO) {
    return new AccountResponseDTO(accountService.updateAccount(user.getAccount().getId(), updateDTO));
  }
}
