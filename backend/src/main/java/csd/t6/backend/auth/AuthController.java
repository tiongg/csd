package csd.t6.backend.auth;

import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.account.dto.AccountResponseDto;
import csd.t6.backend.auth.dto.ExchangeCodeDto;
import csd.t6.backend.auth.dto.LoginDto;
import csd.t6.backend.auth.dto.LoginResponseDto;
import csd.t6.backend.auth.dto.TokenData;
import csd.t6.backend.decorators.auth.PublicDecorator;
import csd.t6.backend.decorators.responses.BadRequestResponse;
import csd.t6.backend.decorators.responses.NoContentResponse;
import csd.t6.backend.decorators.responses.OkResponse;
import csd.t6.backend.exceptions.BadRequestException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final AuthService authService;
  private final OAuthCodeService oauthCodeService;

  public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, AuthService authService,
      OAuthCodeService oauthCodeService) {
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.authService = authService;
    this.oauthCodeService = oauthCodeService;
  }

  @PostMapping("/login")
  @PublicDecorator()
  @OkResponse()
  @BadRequestResponse()
  public LoginResponseDto loginWithPassword(@RequestBody @Valid LoginDto loginDto, HttpServletResponse response) {
    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(loginDto.usernameOrEmail(),
        loginDto.password());

    Authentication auth = this.authenticationManager.authenticate(authToken);
    AuthUserDetails userDetails = (AuthUserDetails) auth.getPrincipal();

    UUID accountId = userDetails.getAccount().getId();
    TokenData tokenData = this.authService.generateTokenData(accountId);
    response.addCookie(tokenData.refreshCookie());

    return new LoginResponseDto(tokenData.accessToken(), new AccountResponseDto(userDetails.getAccount()));
  }

  @PostMapping("/logout")
  @NoContentResponse()
  public void logout(HttpServletResponse response) {
    Cookie refreshCookie = this.authService.getLogoutCookie();
    response.addCookie(refreshCookie);
  }

  @PostMapping("/refresh")
  @PublicDecorator() // Potentially can be called without access token, but cookie instead
  @OkResponse()
  @BadRequestResponse()
  public LoginResponseDto refresh(@CookieValue(name = "refresh_token", required = false) String refreshTokenCookie,
      HttpServletResponse response) {
    if (refreshTokenCookie == null || !jwtService.isTokenValid(refreshTokenCookie)) {
      throw new BadRequestException("Invalid refresh token");
    }

    UUID accountId = jwtService.extractAccountId(refreshTokenCookie);
    TokenData tokenData = this.authService.generateTokenData(accountId);
    response.addCookie(tokenData.refreshCookie());
    return new LoginResponseDto(tokenData.accessToken(), new AccountResponseDto(tokenData.account()));
  }

  @GetMapping("/me")
  @BadRequestResponse()
  @OkResponse()
  public AccountResponseDto getSelf(@AuthenticationPrincipal AuthUserDetails user) {
    if (user == null) {
      throw new BadRequestException("User is not authenticated");
    }
    return new AccountResponseDto(user.getAccount());
  }

  @PostMapping("/exchange")
  @PublicDecorator()
  @OkResponse()
  @BadRequestResponse()
  public LoginResponseDto exchangeCode(@RequestBody @Valid ExchangeCodeDto exchangeCodeDto,
      HttpServletResponse response) {
    UUID accountId = oauthCodeService.consumeCode(exchangeCodeDto.code());
    TokenData tokenData = authService.generateTokenData(accountId);
    response.addCookie(tokenData.refreshCookie());
    return new LoginResponseDto(tokenData.accessToken(), new AccountResponseDto(tokenData.account()));
  }
}
