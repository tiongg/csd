package csd.t6.backend.auth.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.accounts.tables.records.OauthCodeRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OAuthCodeRepositoryTest {

  @Autowired
  private OAuthCodeRepository oauthCodeRepository;

  @Autowired
  private AccountRepository accountRepository;

  @Test
  @DisplayName("Should insert oauth code")
  void shouldInsertOAuthCode() {
    String code = "test-code-32-chars-long-enough";
    OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(10);

    AccountRecord account = accountRepository.insert("test@example.com", "testuser", "$2a$12$hashedpassword");
    var result = oauthCodeRepository.insert(code, account.getId(), expiresAt);

    assertThat(result).isNotNull();
    assertThat(result.getCode()).isEqualTo(code);
    assertThat(result.getAccountId()).isEqualTo(account.getId());
  }

  @Test
  @DisplayName("Should find valid code")
  void shouldFindValidCode() {
    String code = "valid-code-32-chars-long-enough";
    OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(10);

    AccountRecord account = accountRepository.insert("valid@example.com", "validuser", "$2a$12$hashedpassword");
    oauthCodeRepository.insert(code, account.getId(), expiresAt);

    Optional<OauthCodeRecord> result = oauthCodeRepository.findValidByCode(code);

    assertThat(result).isPresent();
  }

  @Test
  @DisplayName("Should not find expired code")
  void shouldNotFindExpiredCode() {
    String code = "expired-code-32-chars-long-enough";
    OffsetDateTime expiresAt = OffsetDateTime.now().minusMinutes(10);

    AccountRecord account = accountRepository.insert("expired@example.com", "expireduser", "$2a$12$hashedpassword");
    oauthCodeRepository.insert(code, account.getId(), expiresAt);

    Optional<OauthCodeRecord> result = oauthCodeRepository.findValidByCode(code);

    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should delete code")
  void shouldDeleteCode() {
    String code = "delete-code-32-chars-long-enough";
    OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(10);

    AccountRecord account = accountRepository.insert("delete@example.com", "deleteuser", "$2a$12$hashedpassword");
    oauthCodeRepository.insert(code, account.getId(), expiresAt);
    oauthCodeRepository.deleteByCode(code);

    Optional<OauthCodeRecord> result = oauthCodeRepository.findValidByCode(code);
    assertThat(result).isEmpty();
  }
}
