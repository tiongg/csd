package csd.t6.backend.auth;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class JwtServiceTest {

  private JwtService jwtService;
  private SecretKey signingKey;
  private final String testSecret =
      "this-is-a-test-secret-key-that-is-long-enough-to-be-256-bits-1234567890";

  @BeforeEach
  void setUp() throws Exception {
    jwtService = new JwtService();

    // Inject configuration properties via reflection (since we don't start Spring context)
    setPrivateField(jwtService, "jwtSecret", testSecret);
    setPrivateField(jwtService, "accessTokenExpirationHours", 1L);
    setPrivateField(jwtService, "refreshTokenExpirationHours", 720L);

    signingKey = Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8));
  }

  private static void setPrivateField(Object target, String fieldName, Object value) throws Exception {
    Field f = target.getClass().getDeclaredField(fieldName);
    f.setAccessible(true);
    f.set(target, value);
  }

  private static Claims parseClaims(String token, SecretKey key) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  @Test
  void generateAccessToken_shouldContainSubjectAndBeValid() {
    UUID accountId = UUID.randomUUID();

    String token = jwtService.generateAccessToken(accountId);

    assertNotNull(token);
    assertTrue(jwtService.isTokenValid(token));

    Claims claims = parseClaims(token, signingKey);
    assertEquals(accountId.toString(), claims.getSubject());

    // Expiration should be roughly now + 1 hour (configured in setUp)
    Instant now = Instant.now();
    Instant exp = claims.getExpiration().toInstant();
    long minutesDiff = ChronoUnit.MINUTES.between(now, exp);
    assertTrue(minutesDiff <= 61 && minutesDiff >= 59, "Access token expiration should be ~1 hour from now");
  }

  @Test
  void extractAccountId_shouldReturnOriginalUUID() {
    UUID accountId = UUID.randomUUID();
    String token = jwtService.generateAccessToken(accountId);

    UUID extracted = jwtService.extractAccountId(token);
    assertEquals(accountId, extracted);
  }

  @Test
  void isTokenValid_shouldReturnFalseForExpiredToken() throws Exception {
    UUID accountId = UUID.randomUUID();

    // Force expiration in the past by configuring negative hours
    setPrivateField(jwtService, "accessTokenExpirationHours", -1L);

    String expiredToken = jwtService.generateAccessToken(accountId);

    assertFalse(jwtService.isTokenValid(expiredToken));
  }

  @Test
  void isTokenValid_shouldReturnFalseForInvalidSignature() {
    UUID accountId = UUID.randomUUID();
    // Build a token with a different secret but otherwise valid structure
    String otherSecret = "another-secret-key-that-is-long-enough-to-sign-jwt-abcdefghijk";
    SecretKey otherKey = Keys.hmacShaKeyFor(otherSecret.getBytes(StandardCharsets.UTF_8));

    Instant now = Instant.now();
    String forged = Jwts.builder()
        .subject(accountId.toString())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(1, ChronoUnit.HOURS)))
        .signWith(otherKey)
        .compact();

    assertFalse(jwtService.isTokenValid(forged));
  }

  @Test
  void generateRefreshToken_shouldRespectConfiguredExpirationHours() throws Exception {
    UUID accountId = UUID.randomUUID();

    // Shorten refresh token to 2 hours to make the test fast and deterministic
    setPrivateField(jwtService, "refreshTokenExpirationHours", 2L);

    String token = jwtService.generateRefreshToken(accountId);
    Claims claims = parseClaims(token, signingKey);

    Instant now = Instant.now();
    Instant exp = claims.getExpiration().toInstant();
    long minutesDiff = ChronoUnit.MINUTES.between(now, exp);
    assertTrue(minutesDiff <= 121 && minutesDiff >= 119, "Refresh token expiration should be ~2 hours from now");
  }
}
