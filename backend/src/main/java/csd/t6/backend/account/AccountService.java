package csd.t6.backend.account;

import java.util.List;

import org.springframework.stereotype.Service;

import csd.t6.jooq.tables.records.AccountRecord;

@Service
public class AccountService {
  private final AccountRepository accountRepository;

  public AccountService(AccountRepository accountRepository) {
    this.accountRepository = accountRepository;
  }

  public List<AccountRecord> getAllAccounts() {
    return this.accountRepository.findAll();
  }

}
