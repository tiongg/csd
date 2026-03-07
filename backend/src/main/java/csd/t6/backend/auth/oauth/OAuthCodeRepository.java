package csd.t6.backend.auth.oauth;

import static csd.t6.jooq.accounts.tables.OauthCode.OAUTH_CODE;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.accounts.tables.records.OauthCodeRecord;

@Repository
public class OAuthCodeRepository {
  private final DSLContext dsl;

  public OAuthCodeRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  public OauthCodeRecord insert(String code, UUID accountId, OffsetDateTime expiresAt) {
    OauthCodeRecord record = dsl.newRecord(OAUTH_CODE);
    record.setCode(code);
    record.setAccountId(accountId);
    record.setExpiresAt(expiresAt);
    record.store();
    return record;
  }

  public Optional<OauthCodeRecord> findValidByCode(String code) {
    OauthCodeRecord found = dsl.selectFrom(OAUTH_CODE).where(OAUTH_CODE.CODE.eq(code))
        .and(OAUTH_CODE.EXPIRES_AT.greaterThan(OffsetDateTime.now())).fetchOne();
    return Optional.ofNullable(found);
  }

  public void deleteByCode(String code) {
    dsl.deleteFrom(OAUTH_CODE).where(OAUTH_CODE.CODE.eq(code)).execute();
  }

  public void deleteExpired() {
    dsl.deleteFrom(OAUTH_CODE).where(OAUTH_CODE.EXPIRES_AT.lessThan(OffsetDateTime.now())).execute();
  }
}
