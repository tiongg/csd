package csd.t6.backend.account;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.account.dto.request.AccountUpdateRequest;
import csd.t6.backend.auth.oauth.OAuth2ProviderRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.enums.OauthProvider;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.accounts.tables.records.OauthConnectionRecord;

@Service
public class AccountService {
  private final AccountRepository accountRepository;
  private final OAuth2ProviderRepository oAuthProviderRepository;

  public AccountService(AccountRepository accountRepository, OAuth2ProviderRepository oAuthProviderRepository) {
    this.accountRepository = accountRepository;
    this.oAuthProviderRepository = oAuthProviderRepository;
  }

  public List<AccountRecord> getAllAccounts() {
    return this.accountRepository.findAll();
  }

  public AccountRecord createNewAccount(String username, String email, String hashedPassword) {
    if (this.accountRepository.exists(ACCOUNT.USERNAME, username)) {
      throw new BadRequestException("Username already exists");
    }

    if (this.accountRepository.exists(ACCOUNT.EMAIL, email)) {
      throw new BadRequestException("Email already exists");
    }

    return this.accountRepository.insert(email, username, hashedPassword);
  }

  public OauthConnectionRecord createWithOAuthLogin(String email, String realname, OauthProvider provider,
      String providerId) {
    AccountRecord account = this.accountRepository.findOneBy(ACCOUNT.EMAIL, email).orElseGet(() -> {
      String usernameBase = email.split("@")[0];
      String username = usernameBase;
      int suffix = 1;
      while (this.accountRepository.exists(ACCOUNT.USERNAME, username)) {
        username = usernameBase + "_" + suffix;
        suffix++;
      }
      return this.accountRepository.insert(email, username, null, realname);
    });
    OauthConnectionRecord oauthAccount = this.oAuthProviderRepository.insert(account.getId(), provider, providerId,
        email);
    return oauthAccount;
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

    return this.accountRepository.save(existingAccount);
  }

  public void deleteAccount(UUID id) {
    int deleted = this.accountRepository.delete(ACCOUNT.ID, id);
    if (deleted == 0) {
      throw new BadRequestException("Account does not exist!");
    }
  }

  public AccountRecord updateAccountRole(UUID id, Roles role) {
    AccountRecord existingAccount = this.accountRepository.findOneBy(ACCOUNT.ID, id)
        .orElseThrow(() -> new BadRequestException("Account does not exist"));

    existingAccount.setUserRole(role);
    return this.accountRepository.save(existingAccount);
  }
}
