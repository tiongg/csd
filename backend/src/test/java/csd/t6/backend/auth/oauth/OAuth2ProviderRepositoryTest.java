package csd.t6.backend.auth.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.jooq.accounts.enums.OauthProvider;
import csd.t6.jooq.accounts.tables.records.OauthConnectionRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OAuth2ProviderRepositoryTest {

  @Autowired
  private OAuth2ProviderRepository oAuth2ProviderRepository;

  @Test
  @DisplayName("Should insert oauth connection")
  void shouldInsertOAuthConnection() {
    UUID accountId = UUID.randomUUID();
    String providerId = "google-12345";
    String email = "test@example.com";

    var result = oAuth2ProviderRepository.insert(accountId, OauthProvider.GOOGLE, providerId, email);

    assertThat(result).isNotNull();
    assertThat(result.getAccountId()).isEqualTo(accountId);
    assertThat(result.getProvider()).isEqualTo(OauthProvider.GOOGLE);
    assertThat(result.getProviderId()).isEqualTo(providerId);
    assertThat(result.getEmail()).isEqualTo(email);
  }

  @Test
  @DisplayName("Should find by provider and provider id")
  void shouldFindByProviderAndProviderId() {
    UUID accountId = UUID.randomUUID();
    String providerId = "google-67890";
    String email = "user@gmail.com";

    oAuth2ProviderRepository.insert(accountId, OauthProvider.GOOGLE, providerId, email);

    Optional<OauthConnectionRecord> result = oAuth2ProviderRepository.findByProviderAndProviderId(OauthProvider.GOOGLE, providerId);

    assertThat(result).isPresent();
  }

  @Test
  @DisplayName("Should find by account id")
  void shouldFindByAccountId() {
    UUID accountId = UUID.randomUUID();
    String providerId = "google-11111";

    oAuth2ProviderRepository.insert(accountId, OauthProvider.GOOGLE, providerId, "test@gmail.com");

    Optional<OauthConnectionRecord> result = oAuth2ProviderRepository.findByAccountId(accountId);

    assertThat(result).isPresent();
  }

  @Test
  @DisplayName("Should return empty when not found by provider and id")
  void shouldReturnEmptyWhenNotFoundByProviderAndId() {
    Optional<OauthConnectionRecord> result = oAuth2ProviderRepository.findByProviderAndProviderId(OauthProvider.GOOGLE, "nonexistent");

    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should return empty when not found by account id")
  void shouldReturnEmptyWhenNotFoundByAccountId() {
    Optional<OauthConnectionRecord> result = oAuth2ProviderRepository.findByAccountId(UUID.randomUUID());

    assertThat(result).isEmpty();
  }
}
