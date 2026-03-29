package csd.t6.backend.auth.oauth;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.OauthCodeRecord;

@Service
public class OAuthCodeService {
  @Value("${oauth.code.expiration-minutes:5}")
  private int codeExpirationMinutes;

  private static final int CODE_LENGTH = 24;
  private final SecureRandom secureRandom = new SecureRandom();

  private final OAuthCodeRepository oauthCodeRepository;

  public OAuthCodeService(OAuthCodeRepository oauthCodeRepository) {
    this.oauthCodeRepository = oauthCodeRepository;
  }

  public String createCode(UUID accountId) {
    String code = generateCode();
    OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(codeExpirationMinutes);
    oauthCodeRepository.insert(code, accountId, expiresAt);
    return code;
  }

  public UUID consumeCode(String code) {
    OauthCodeRecord record = oauthCodeRepository.findValidByCode(code)
        .orElseThrow(() -> new BadRequestException("Invalid or expired code"));

    UUID accountId = record.getAccountId();
    oauthCodeRepository.deleteByCode(code);
    return accountId;
  }

  private String generateCode() {
    byte[] bytes = new byte[CODE_LENGTH];
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }
}