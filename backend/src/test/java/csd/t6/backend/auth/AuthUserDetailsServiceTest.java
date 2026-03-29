package csd.t6.backend.auth;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@ExtendWith(MockitoExtension.class)
class AuthUserDetailsServiceTest {

  @Mock
  private AccountRepository accountRepository;

  @InjectMocks
  private AuthUserDetailsService authUserDetailsService;

  private UUID accountId;
  private String username;
  private String email;
  private String passwordHash;
  private AccountRecord accountRecord;

  @BeforeEach
  void setUp() {
    accountId = UUID.randomUUID();
    username = "testuser";
    email = "test@example.com";
    passwordHash = "$2a$12$hashedpassword";
    accountRecord = new AccountRecord();
    accountRecord.setId(accountId);
    accountRecord.setUsername(username);
    accountRecord.setEmail(email);
    accountRecord.setPasswordHash(passwordHash);
    accountRecord.setUserRole(Roles.LEARNER);
  }

  @Test
  @DisplayName("Should load user by username")
  void shouldLoadUserByUsername() {
    when(accountRepository.findOneBy(ACCOUNT.USERNAME, username)).thenReturn(Optional.of(accountRecord));

    AuthUserDetails result = authUserDetailsService.loadUserByUsername(username);

    assertThat(result).isNotNull();
    assertThat(result.getUsername()).isEqualTo(username);
    assertThat(result.getId()).isEqualTo(accountId);
    assertThat(result.getAuthorities()).hasSize(1);
  }

  @Test
  @DisplayName("Should load user by email")
  void shouldLoadUserByEmail() {
    when(accountRepository.findOneBy(ACCOUNT.USERNAME, email)).thenReturn(Optional.empty());
    when(accountRepository.findOneBy(ACCOUNT.EMAIL, email)).thenReturn(Optional.of(accountRecord));

    AuthUserDetails result = authUserDetailsService.loadUserByUsername(email);

    assertThat(result).isNotNull();
    assertThat(result.getUsername()).isEqualTo(username);
    assertThat(result.getId()).isEqualTo(accountId);
  }

  @Test
  @DisplayName("Should throw when user not found")
  void shouldThrowWhenUserNotFound() {
    when(accountRepository.findOneBy(ACCOUNT.USERNAME, "nonexistent")).thenReturn(Optional.empty());
    when(accountRepository.findOneBy(ACCOUNT.EMAIL, "nonexistent")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> authUserDetailsService.loadUserByUsername("nonexistent"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Invalid credentials");
  }

  @Test
  @DisplayName("Should throw when username exists but email is used as input")
  void shouldThrowWhenEmailNotFound() {
    String nonExistentEmail = "nonexistent@example.com";
    when(accountRepository.findOneBy(ACCOUNT.USERNAME, nonExistentEmail)).thenReturn(Optional.empty());
    when(accountRepository.findOneBy(ACCOUNT.EMAIL, nonExistentEmail)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> authUserDetailsService.loadUserByUsername(nonExistentEmail))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Invalid credentials");
  }

  @Test
  @DisplayName("Should return correct authorities for admin role")
  void shouldReturnCorrectAuthoritiesForAdmin() {
    accountRecord.setUserRole(Roles.ADMIN);
    when(accountRepository.findOneBy(ACCOUNT.USERNAME, username)).thenReturn(Optional.of(accountRecord));

    AuthUserDetails result = authUserDetailsService.loadUserByUsername(username);

    assertThat(result).isNotNull();
    assertThat(result.getAuthorities()).hasSize(1);
  }

  @Test
  @DisplayName("Should return correct authorities for contributor role")
  void shouldReturnCorrectAuthoritiesForContributor() {
    accountRecord.setUserRole(Roles.CONTRIBUTOR);
    when(accountRepository.findOneBy(ACCOUNT.USERNAME, username)).thenReturn(Optional.of(accountRecord));

    AuthUserDetails result = authUserDetailsService.loadUserByUsername(username);

    assertThat(result).isNotNull();
    assertThat(result.getAuthorities()).hasSize(1);
  }
}
