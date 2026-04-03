package csd.t6.backend.account;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.account.dto.request.AccountUpdateRequest;
import csd.t6.backend.account.dto.response.ProfilePictureUploadResponse;
import csd.t6.backend.auth.oauth.OAuth2ProviderRepository;
import csd.t6.backend.contributor.PendingContributorRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.exceptions.ForbiddenException;
import csd.t6.backend.utils.FileService;
import csd.t6.jooq.accounts.enums.OauthProvider;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.accounts.tables.records.OauthConnectionRecord;

@Service
public class AccountService {
  private final AccountRepository accountRepository;
  private final OAuth2ProviderRepository oAuthProviderRepository;
  private final PendingContributorRepository pendingContributorRepository;
  private final FileService fileService;

  public AccountService(AccountRepository accountRepository, OAuth2ProviderRepository oAuthProviderRepository,
      PendingContributorRepository pendingContributorRepository, FileService fileService) {
    this.accountRepository = accountRepository;
    this.oAuthProviderRepository = oAuthProviderRepository;
    this.pendingContributorRepository = pendingContributorRepository;
    this.fileService = fileService;
  }

  public List<AccountRecord> getAllAccounts() {
    return this.accountRepository.findAll();
  }

  public AccountRecord createNewAccount(String username, String email, String realName, String hashedPassword) {
    if (this.accountRepository.exists(ACCOUNT.USERNAME, username)) {
      throw new BadRequestException("Username already exists");
    }
    if (this.accountRepository.exists(ACCOUNT.EMAIL, email)) {
      throw new BadRequestException("Email already exists");
    }
    return this.accountRepository.insert(email, username, hashedPassword, realName);
  }

  public OauthConnectionRecord createWithOAuthLogin(String email, String realname, OauthProvider provider,
      String providerId, String profilePictureUrl) {
    AccountRecord account = this.accountRepository.findOneBy(ACCOUNT.EMAIL, email).orElseGet(() -> {
      String usernameBase = email.split("@")[0];
      String username = usernameBase;
      int suffix = 1;
      while (this.accountRepository.exists(ACCOUNT.USERNAME, username)) {
        username = usernameBase + "_" + suffix;
        suffix++;
      }
      AccountRecord newAccount = this.accountRepository.insert(email, username, null, realname);
      if (profilePictureUrl != null) {
        newAccount.setProfilePictureUrl(profilePictureUrl);
      }
      return this.accountRepository.save(newAccount);
    });
    return this.oAuthProviderRepository.insert(account.getId(), provider, providerId, email);
  }

  public AccountRecord updateAccount(UUID id, AccountUpdateRequest updateDTO) {
    AccountRecord existingAccount = this.accountRepository.findOneBy(ACCOUNT.ID, id)
        .orElseThrow(() -> new BadRequestException("Account does not exist"));

    if (updateDTO.username() != null && !existingAccount.getUsername().equals(updateDTO.username())
        && this.accountRepository.exists(ACCOUNT.USERNAME, updateDTO.username())) {
      throw new BadRequestException("Username already exists");
    }

    if (updateDTO.username() != null) {
      existingAccount.setUsername(updateDTO.username());
    }

    if (updateDTO.realName() != null) {
      existingAccount.setRealName(updateDTO.realName());
    }

    if (updateDTO.profilePictureUrl() != null) {
      existingAccount.setProfilePictureUrl(updateDTO.profilePictureUrl());
    }

    if (updateDTO.password() != null) {
      existingAccount.setPasswordHash(updateDTO.password());
    }

    return this.accountRepository.save(existingAccount);
  }

  public void deleteAccount(UUID id) {
    int deleted = this.accountRepository.delete(ACCOUNT.ID, id);
    if (deleted == 0) {
      throw new BadRequestException("Account does not exist!");
    }
  }

  /**
   * Allow admins to update role of any user by specifying target account ID.
   * Enforces that the requestor is an ADMIN at the service layer, independent of
   * any controller-level checks.
   *
   * @param id          The ID of the account whose role is being updated
   * @param role        The new role to assign
   * @param requestorId The ID of the user making the request
   * @return The updated account record
   */
  public AccountRecord updateAccountRole(UUID id, Roles role, UUID requestorId) {
    // Verify the requestor exists and is an ADMIN
    AccountRecord requestorAccount = this.accountRepository.findOneBy(ACCOUNT.ID, requestorId)
        .orElseThrow(() -> new BadRequestException("Admin account not found"));

    if (requestorAccount.getUserRole() != Roles.ADMIN) {
      throw new ForbiddenException("Only admins can update user roles");
    }

    // Verify the target account exists
    AccountRecord existingAccount = this.accountRepository.findOneBy(ACCOUNT.ID, id)
        .orElseThrow(() -> new BadRequestException("Account does not exist"));

    this.pendingContributorRepository.deletePendingContributors(Arrays.asList(id));
    existingAccount.setUserRole(role);
    return this.accountRepository.save(existingAccount);
  }

  /**
   * Original method for backward compatibility. Allows updating role only for
   * account being modified.
   */
  public AccountRecord updateAccountRole(UUID id, Roles role) {
    AccountRecord existingAccount = this.accountRepository.findOneBy(ACCOUNT.ID, id)
        .orElseThrow(() -> new BadRequestException("Account does not exist"));
    existingAccount.setUserRole(role);
    return this.accountRepository.save(existingAccount);
  }

  public ProfilePictureUploadResponse getProfilePictureUploadUrl(UUID accountId, String extension) {
    if (!extension.equals("png") && !extension.equals("jpg") && !extension.equals("jpeg")) {
      throw new BadRequestException("Invalid file type! Only png, jpg, jpeg are allowed.");
    }

    String key = String.format("profile-pictures/%s.%s", accountId, extension);
    String url = this.fileService.generatePresignedUploadUrl(key);
    String publicUrl = this.fileService.getPublicUrl(key);
    return new ProfilePictureUploadResponse(url, key, publicUrl);
  }
}
