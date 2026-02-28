package csd.t6.backend.account;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.account.dto.request.AccountCreateRequest;
import csd.t6.backend.account.dto.request.AccountRoleUpdateRequest;
import csd.t6.backend.account.dto.request.AccountUpdateRequest;
import csd.t6.backend.account.dto.response.AccountResponse;
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
  private final PasswordEncoder passwordEncoder;

  public AccountController(AccountService accountService, PasswordEncoder passwordEncoder) {
    this.accountService = accountService;
    this.passwordEncoder = passwordEncoder;
  }

  @GetMapping("/")
  public List<AccountResponse> getAll() {
    return accountService.getAllAccounts().stream().map(record -> new AccountResponse(record)).toList();
  }

  @PostMapping("/")
  @PublicDecorator()
  @CreatedResponse()
  @BadRequestResponse()
  public AccountResponse createAccount(@RequestBody @Valid AccountCreateRequest createDTO) {
    String hashedPassword = passwordEncoder.encode(createDTO.password());
    return new AccountResponse(
        accountService.createNewAccount(createDTO.username(), createDTO.email(), hashedPassword));
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
  public AccountResponse updateAccount(@AuthenticationPrincipal AuthUserDetails user,
      @RequestBody @Valid AccountUpdateRequest updateDTO) {
    return new AccountResponse(accountService.updateAccount(user.getAccount().getId(), updateDTO));
  }

  @PatchMapping("/{accountId}/role")
  @BadRequestResponse()
  @OkResponse()
  @Operation(summary = "Update role of any user account", description = "Allows admins to update the role of any user account by specifying the target account ID. The requestor ID is the account ID of the admin making the request.")
  public AccountResponse updateAnyAccountRole(@PathVariable String accountId,
      @RequestBody @Valid AccountRoleUpdateRequest roleUpdateDTO,
      @AuthenticationPrincipal AuthUserDetails requesterDetails) {
    // Only admins can update roles
    if (requesterDetails.getAccount().getUserRole() != Roles.ADMIN) {
      throw new BadRequestException("Only admins can update user roles");
    }

    return new AccountResponse(accountService.updateAccountRole(UUID.fromString(accountId), roleUpdateDTO.role(), requesterDetails.getAccount().getId()));
  }

  @PatchMapping("/{accountId}/role")
  @BadRequestResponse()
  @OkResponse()
  @Operation(summary = "Update role of user account", description = "Updates the role of the account making the request. Original method for backward compatibility.")
  public AccountResponse updateAccountRole(@PathVariable String accountId,
      @RequestBody @Valid AccountRoleUpdateRequest roleUpdateDTO,
      @AuthenticationPrincipal AuthUserDetails requesterDetails) {
    return new AccountResponse(accountService.updateAccountRole(UUID.fromString(accountId), roleUpdateDTO.role()));
  }
}
