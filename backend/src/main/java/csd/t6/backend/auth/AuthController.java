package csd.t6.backend.auth;

import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.account.dto.AccountResponseDTO;
import csd.t6.backend.auth.dto.LoginDto;
import csd.t6.backend.auth.dto.LoginResponseDto;
import csd.t6.backend.decorators.auth.PublicDecorator;
import csd.t6.backend.decorators.responses.BadRequestResponse;
import csd.t6.backend.decorators.responses.NoContentResponse;
import csd.t6.backend.decorators.responses.OkResponse;
import csd.t6.backend.exceptions.BadRequestException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;

  public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
  }

  @PostMapping("/login")
  @PublicDecorator()
  @OkResponse()
  @BadRequestResponse()
  public LoginResponseDto loginWithPassword(
      @RequestBody LoginDto loginDto,
      HttpServletResponse response) {

    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
        loginDto.usernameOrEmail(),
        loginDto.password());

    Authentication auth = this.authenticationManager.authenticate(authToken);
    AuthUserDetails userDetails = (AuthUserDetails) auth.getPrincipal();

    UUID accountId = userDetails.getAccount().getId();
    String accessToken = jwtService.generateAccessToken(accountId);
    String refreshToken = jwtService.generateRefreshToken(accountId);

    // Set refresh token in httpOnly cookie
    Cookie refreshCookie = this.createRefreshTokenCookie(refreshToken);
    refreshCookie.setMaxAge((int) jwtService.getRefreshTokenExpirationHours() * 3600);
    response.addCookie(refreshCookie);

    return new LoginResponseDto(accessToken, new AccountResponseDTO(userDetails.getAccount()));
  }

  @PostMapping("/logout")
  @NoContentResponse()
  public void logout(HttpServletResponse response) {
    // Clear refresh token cookie
    Cookie refreshCookie = this.createRefreshTokenCookie("");
    refreshCookie.setMaxAge(0);
    response.addCookie(refreshCookie);
  }

  @PostMapping("/refresh")
  @OkResponse()
  @BadRequestResponse()
  public LoginResponseDto refresh(
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    UUID accountId = userDetails.getAccount().getId();
    String accessToken = jwtService.generateAccessToken(accountId);

    return new LoginResponseDto(accessToken, new AccountResponseDTO(userDetails.getAccount()));
  }

  @GetMapping("/me")
  @BadRequestResponse()
  @OkResponse()
  public AccountResponseDTO getSelf(@AuthenticationPrincipal AuthUserDetails user) {
    if (user == null) {
      throw new BadRequestException("User is not authenticated");
    }
    return new AccountResponseDTO(user.getAccount());
  }

  private Cookie createRefreshTokenCookie(String refreshToken) {
    Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
    refreshCookie.setHttpOnly(true);
    refreshCookie.setSecure(true);
    refreshCookie.setPath("/");
    refreshCookie.setAttribute("SameSite", "None");
    return refreshCookie;
  }
}
