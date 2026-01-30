package csd.t6.backend.auth;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@Service
public class AuthUserDetailsService implements UserDetailsService {
  private final AccountRepository accountRepository;

  public AuthUserDetailsService(AccountRepository accountRepository) {
    this.accountRepository = accountRepository;
  }

  @Override
  public AuthUserDetails loadUserByUsername(String usernameOrEmail) {
    AccountRecord accountRecord = this.accountRepository.findBy(ACCOUNT.USERNAME, usernameOrEmail)
        .or(() -> this.accountRepository.findBy(ACCOUNT.EMAIL, usernameOrEmail))
        .orElseThrow(() -> new BadRequestException("Invalid credentials"));

    return new AuthUserDetails(accountRecord);
  }
}