package csd.t6.backend.auth.oauth;

import static csd.t6.jooq.accounts.tables.OauthConnection.OAUTH_CONNECTION;

import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.accounts.enums.OauthProvider;
import csd.t6.jooq.accounts.tables.records.OauthConnectionRecord;

@Repository
public class OAuth2ProviderRepository {
  private final DSLContext dsl;

  public OAuth2ProviderRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  public Optional<OauthConnectionRecord> findByProviderAndProviderId(OauthProvider provider, String providerId) {
    OauthConnectionRecord found = dsl.selectFrom(OAUTH_CONNECTION).where(OAUTH_CONNECTION.PROVIDER.eq(provider))
        .and(OAUTH_CONNECTION.PROVIDER_ID.eq(providerId)).fetchOne();
    return Optional.ofNullable(found);
  }

  public Optional<OauthConnectionRecord> findByAccountId(UUID accountId) {
    OauthConnectionRecord found = dsl.selectFrom(OAUTH_CONNECTION).where(OAUTH_CONNECTION.ACCOUNT_ID.eq(accountId))
        .fetchOne();
    return Optional.ofNullable(found);
  }

  public OauthConnectionRecord insert(UUID accountId, OauthProvider provider, String providerId, String email) {
    OauthConnectionRecord record = dsl.newRecord(OAUTH_CONNECTION);
    record.setAccountId(accountId);
    record.setProvider(provider);
    record.setProviderId(providerId);
    record.setEmail(email);
    record.store();
    return record;
  }
}
