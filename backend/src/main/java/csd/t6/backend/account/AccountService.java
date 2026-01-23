package csd.t6.backend.account;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.account.dto.AccountCreateRequest;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.auth.tables.records.AccountRecord;

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
    if (this.accountRepository.usernameExists(createDTO.username())) {
      throw new BadRequestException("Username already exists");
    }

    return this.accountRepository.insert(
        createDTO.email(),
        createDTO.username(),
        createDTO.password());
  }

  public void deleteAccount(UUID id) {
    this.accountRepository.delete(id);
  }
}
