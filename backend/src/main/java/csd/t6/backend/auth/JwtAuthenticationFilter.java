package csd.t6.backend.auth;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import csd.t6.backend.account.AccountRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final AccountRepository accountRepository;

  public JwtAuthenticationFilter(
      JwtService jwtService,
      AccountRepository accountRepository) {
    this.jwtService = jwtService;
    this.accountRepository = accountRepository;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    // Try to get access token from Authorization header
    String authHeader = request.getHeader("Authorization");
    String accessToken = null;

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7);
    }

    // If no access token, try to use refresh token from cookie
    if (accessToken == null) {
      String refreshToken = getRefreshTokenFromCookie(request);
      if (refreshToken != null && jwtService.isTokenValid(refreshToken)) {
        UUID accountId = jwtService.extractAccountId(refreshToken);
        // Set authentication for refresh endpoint
        setAuthentication(accountId, request);
      }
    } else if (jwtService.isTokenValid(accessToken)) {
      // Valid access token found
      UUID accountId = jwtService.extractAccountId(accessToken);
      setAuthentication(accountId, request);
    }

    filterChain.doFilter(request, response);
  }

  private String getRefreshTokenFromCookie(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if ("refresh_token".equals(cookie.getName())) {
          return cookie.getValue();
        }
      }
    }
    return null;
  }

  private void setAuthentication(UUID accountId, HttpServletRequest request) {
    Optional<AccountRecord> accountRecord = accountRepository.findBy(ACCOUNT.ID, accountId);
    if (accountRecord.isPresent()) {
      AuthUserDetails userDetails = new AuthUserDetails(accountRecord.get());
      UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
          userDetails,
          null,
          userDetails.getAuthorities());
      authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authToken);
    }
  }
}
