package csd.t6.backend.auth;

import java.util.Collection;
import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import csd.t6.jooq.accounts.tables.records.AccountRecord;

public class AuthUserDetails implements UserDetails {

  private final AccountRecord account;
  private final List<GrantedAuthority> authorities;

  public AuthUserDetails(AccountRecord account) {
    this.account = account;
    this.authorities = List.of(
        new SimpleGrantedAuthority(account.getUserRole().toString()));
  }

  public AccountRecord getAccount() {
    return account;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return authorities;
  }

  @Override
  public @Nullable String getPassword() {
    return account.getPasswordHash();
  }

  @Override
  public String getUsername() {
    return account.getUsername();
  }
}
