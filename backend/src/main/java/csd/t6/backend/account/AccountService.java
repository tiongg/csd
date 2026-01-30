package csd.t6.backend.account;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import csd.t6.backend.account.dto.AccountCreateRequest;
import csd.t6.backend.account.dto.AccountUpdateRequest;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@Service
public class AccountService {
  private final AccountRepository accountRepository;
  private final PasswordEncoder passwordEncoder;

  public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
    this.accountRepository = accountRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public List<AccountRecord> getAllAccounts() {
    return this.accountRepository.findAll();
  }

  public AccountRecord createNewAccount(AccountCreateRequest createDTO) {
    if (this.accountRepository.exists(ACCOUNT.USERNAME, createDTO.username())) {
      throw new BadRequestException("Username already exists");
    }

    if (this.accountRepository.exists(ACCOUNT.EMAIL, createDTO.email())) {
      throw new BadRequestException("Email already exists");
    }

    String hashedPassword = this.passwordEncoder.encode(createDTO.password());

    return this.accountRepository.insert(createDTO.email(), createDTO.username(), hashedPassword);
  }

  public AccountRecord updateAccount(UUID id, AccountUpdateRequest updateDTO) {
    AccountRecord existingAccount = this.accountRepository.findBy(ACCOUNT.ID, id)
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

    return this.accountRepository.update(existingAccount);
  }

  public void deleteAccount(UUID id) {
    if (!this.accountRepository.exists(ACCOUNT.ID, id)) {
      throw new BadRequestException("Account does not exist");
    }
    this.accountRepository.delete(id);
  }
}
