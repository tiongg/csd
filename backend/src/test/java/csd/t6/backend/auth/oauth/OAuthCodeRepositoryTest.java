package csd.t6.backend.auth.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.jooq.accounts.tables.records.OauthCodeRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OAuthCodeRepositoryTest {

  @Autowired
  private OAuthCodeRepository oauthCodeRepository;

  @Test
  @DisplayName("Should insert oauth code")
  void shouldInsertOAuthCode() {
    String code = "test-code-32-chars-long-enough";
    UUID accountId = UUID.randomUUID();
    OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(10);

    var result = oauthCodeRepository.insert(code, accountId, expiresAt);

    assertThat(result).isNotNull();
    assertThat(result.getCode()).isEqualTo(code);
    assertThat(result.getAccountId()).isEqualTo(accountId);
  }

  @Test
  @DisplayName("Should find valid code")
  void shouldFindValidCode() {
    String code = "valid-code-32-chars-long-enough";
    UUID accountId = UUID.randomUUID();
    OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(10);

    oauthCodeRepository.insert(code, accountId, expiresAt);

    Optional<OauthCodeRecord> result = oauthCodeRepository.findValidByCode(code);

    assertThat(result).isPresent();
  }

  @Test
  @DisplayName("Should not find expired code")
  void shouldNotFindExpiredCode() {
    String code = "expired-code-32-chars-long-enough";
    UUID accountId = UUID.randomUUID();
    OffsetDateTime expiresAt = OffsetDateTime.now().minusMinutes(10);

    oauthCodeRepository.insert(code, accountId, expiresAt);

    Optional<OauthCodeRecord> result = oauthCodeRepository.findValidByCode(code);

    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should delete code")
  void shouldDeleteCode() {
    String code = "delete-code-32-chars-long-enough";
    UUID accountId = UUID.randomUUID();
    OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(10);

    oauthCodeRepository.insert(code, accountId, expiresAt);
    oauthCodeRepository.deleteByCode(code);

    Optional<OauthCodeRecord> result = oauthCodeRepository.findValidByCode(code);
    assertThat(result).isEmpty();
  }
}
