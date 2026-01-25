package csd.t6.backend.auth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
  @Value("${jwt.secret:your-very-long-secret-key-at-least-256-bits-long-for-hs256}")
  private String jwtSecret;

  @Value("${jwt.access-token.expiration:1}")
  private long accessTokenExpirationHours;

  @Value("${jwt.refresh-token.expiration:720}")
  private long refreshTokenExpirationHours;

  private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
  }

  public String generateAccessToken(UUID accountId) {
    return generateToken(accountId, accessTokenExpirationHours, ChronoUnit.HOURS);
  }

  public String generateRefreshToken(UUID accountId) {
    return generateToken(accountId, refreshTokenExpirationHours, ChronoUnit.HOURS);
  }

  private String generateToken(UUID accountId, long expiration, ChronoUnit unit) {
    Instant now = Instant.now();
    Instant expiry = now.plus(expiration, unit);

    return Jwts.builder().subject(accountId.toString()).issuedAt(Date.from(now)).expiration(Date.from(expiry))
        .signWith(getSigningKey()).compact();
  }

  public UUID extractAccountId(String token) {
    Claims claims = extractAllClaims(token);
    return UUID.fromString(claims.getSubject());
  }

  public boolean isTokenValid(String token) {
    try {
      Claims claims = extractAllClaims(token);
      return claims.getExpiration().after(Date.from(Instant.now()));
    } catch (Exception e) {
      return false;
    }
  }

  private Claims extractAllClaims(String token) {
    return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
  }

  public long getAccessTokenExpirationHours() {
    return accessTokenExpirationHours;
  }

  public long getRefreshTokenExpirationHours() {
    return refreshTokenExpirationHours;
  }
}
