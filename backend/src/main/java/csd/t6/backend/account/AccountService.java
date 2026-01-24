package csd.t6.backend.account;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.account.dto.AccountCreateRequest;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@Service
public class AccountService {
  private final AccountRepository accountRepository;

  public AccountService(AccountRepository accountRepository) {
    this.accountRepository = accountRepository;
  }

  public List<AccountRecord> getAllAccounts() {
    return this.accountRepository.findAll();
  }

  public AccountRecord createNewAccount(AccountCreateRequest createDTO) {
    if (this.accountRepository.exists(ACCOUNT.USERNAME, createDTO.username())) {
      throw new BadRequestException("Username already exists");
    }

    return this.accountRepository.insert(
        createDTO.email(),
        createDTO.username(),
        createDTO.password());
  }

  public void deleteAccount(UUID id) {
    if (!this.accountRepository.exists(ACCOUNT.ID, id)) {
      throw new BadRequestException("Account does not exist");
    }
    this.accountRepository.delete(id);
  }
}
