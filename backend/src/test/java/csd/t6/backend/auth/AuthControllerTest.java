package csd.t6.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import csd.t6.backend.auth.dto.LoginDto;
import csd.t6.backend.auth.dto.LoginResponseDto;
import csd.t6.backend.auth.dto.TokenData;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import org.mockito.Mockito;

class AuthControllerTest {

  @Test
  void loginWithPassword_returnsTokenAndAddsRefreshCookie() {
    AuthenticationManager authenticationManager = Mockito.mock(AuthenticationManager.class);
    JwtService jwtService = Mockito.mock(JwtService.class);
    AuthService authService = Mockito.mock(AuthService.class);
    OAuthCodeService oauthCodeService = Mockito.mock(OAuthCodeService.class);
    HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
    Authentication authentication = Mockito.mock(Authentication.class);

    AuthController controller = new AuthController(authenticationManager, jwtService, authService, oauthCodeService);

    UUID accountId = UUID.randomUUID();
    AccountRecord account = new AccountRecord();
    account.setId(accountId);
    account.setEmail("alice@example.com");
    account.setUsername("alice");
    account.setRealName("Alice");
    account.setUserRole(Roles.STUDENT);

    AuthUserDetails principal = new AuthUserDetails(account);
    Cookie refreshCookie = new Cookie("refresh_token", "refresh-token");
    TokenData tokenData = new TokenData("access-token", account, refreshCookie);

    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
    when(authentication.getPrincipal()).thenReturn(principal);
    when(authService.generateTokenData(accountId)).thenReturn(tokenData);

    LoginResponseDto result = controller.loginWithPassword(new LoginDto("alice", "password123"), response);

    assertNotNull(result);
    assertEquals("access-token", result.accessToken());
    assertEquals(accountId, result.account().id());
    assertEquals("alice@example.com", result.account().email());
    verify(response).addCookie(refreshCookie);
  }
}
