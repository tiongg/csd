package csd.t6.backend.auth;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.auth.dto.responses.TokenDataResponse;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import jakarta.servlet.http.Cookie;

@Service
public class AuthService {
  private final AccountRepository accountRepository;
  private final JwtService jwtService;

  public AuthService(AccountRepository accountRepository, JwtService jwtService) {
    this.accountRepository = accountRepository;
    this.jwtService = jwtService;
  }

  public TokenDataResponse generateTokenData(UUID accountId) {
    String accessToken = jwtService.generateAccessToken(accountId);
    String refreshToken = jwtService.generateRefreshToken(accountId);

    Cookie refreshCookie = this.createRefreshTokenCookie(refreshToken);
    refreshCookie.setMaxAge((int) jwtService.getRefreshTokenExpirationHours() * 3600);

    AccountRecord account = this.accountRepository.findOneBy(ACCOUNT.ID, accountId).orElse(null);
    return new TokenDataResponse(accessToken, account, refreshCookie);
  }

  public Cookie getLogoutCookie() {
    Cookie logoutCookie = createRefreshTokenCookie("");
    logoutCookie.setMaxAge(0);
    return logoutCookie;
  }

  private Cookie createRefreshTokenCookie(String refreshToken) {
    Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
    refreshCookie.setHttpOnly(true);
    // refreshCookie.setSecure(true);
    refreshCookie.setPath("/");
    refreshCookie.setAttribute("SameSite", "Lax");
    return refreshCookie;
  }
}
