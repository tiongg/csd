package csd.t6.backend.auth.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import csd.t6.backend.account.AccountService;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.enums.OauthProvider;
import csd.t6.jooq.accounts.tables.records.OauthConnectionRecord;

@ExtendWith(MockitoExtension.class)
class OAuth2SuccessHandlerTest {

  @Mock
  private OAuthCodeService oauthCodeService;

  @Mock
  private AccountService accountService;

  @Mock
  private OAuth2ProviderRepository oauth2ProviderRepository;

  @InjectMocks
  private OAuth2SuccessHandler oauth2SuccessHandler;

  private MockHttpServletRequest request;
  private MockHttpServletResponse response;
  private OAuth2User oauth2User;
  private OAuth2AuthenticationToken authentication;
  private UUID accountId;
  private OauthConnectionRecord oauthConnectionRecord;

  @BeforeEach
  void setUp() {
    request = new MockHttpServletRequest();
    response = new MockHttpServletResponse();
    accountId = UUID.randomUUID();

    Map<String, Object> attributes = new HashMap<>();
    attributes.put("sub", "google-provider-id");
    attributes.put("name", "Test User");
    attributes.put("email", "test@example.com");
    attributes.put("picture", "https://example.com/picture.jpg");

    oauth2User = new DefaultOAuth2User(
        java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")),
        attributes,
        "sub");

    authentication = new OAuth2AuthenticationToken(oauth2User,
        java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")),
        "google");

    oauthConnectionRecord = new OauthConnectionRecord();
    oauthConnectionRecord.setAccountId(accountId);
    oauthConnectionRecord.setProviderId("google-provider-id");
    oauthConnectionRecord.setProvider(OauthProvider.GOOGLE);
  }

  @Test
  @DisplayName("Should handle Google OAuth authentication successfully with existing account")
  void shouldHandleGoogleOAuthWithExistingAccount() throws IOException {
    when(oauth2ProviderRepository.findByProviderAndProviderId(OauthProvider.GOOGLE, "google-provider-id"))
        .thenReturn(Optional.of(oauthConnectionRecord));
    when(oauthCodeService.createCode(accountId)).thenReturn("auth-code");

    oauth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

    assertThat(response.getRedirectedUrl()).contains("http://localhost:3000/login/callback?code=auth-code");
    verify(oauth2ProviderRepository).findByProviderAndProviderId(OauthProvider.GOOGLE, "google-provider-id");
    verify(oauthCodeService).createCode(accountId);
    verify(accountService, org.mockito.Mockito.never()).createWithOAuthLogin(anyString(), anyString(), any(),
        anyString(), anyString());
  }

  @Test
  @DisplayName("Should handle Google OAuth authentication successfully with new account")
  void shouldHandleGoogleOAuthWithNewAccount() throws IOException {
    when(oauth2ProviderRepository.findByProviderAndProviderId(OauthProvider.GOOGLE, "google-provider-id"))
        .thenReturn(Optional.empty());
    when(accountService.createWithOAuthLogin("test@example.com", "Test User", OauthProvider.GOOGLE,
        "google-provider-id", "https://example.com/picture.jpg"))
        .thenReturn(oauthConnectionRecord);
    when(oauthCodeService.createCode(accountId)).thenReturn("new-auth-code");

    oauth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

    assertThat(response.getRedirectedUrl()).contains("http://localhost:3000/login/callback?code=new-auth-code");
    verify(oauth2ProviderRepository).findByProviderAndProviderId(OauthProvider.GOOGLE, "google-provider-id");
    verify(accountService).createWithOAuthLogin("test@example.com", "Test User", OauthProvider.GOOGLE,
        "google-provider-id", "https://example.com/picture.jpg");
    verify(oauthCodeService).createCode(accountId);
  }

  @Test
  @DisplayName("Should extract user info from Google OAuth")
  void shouldExtractUserInfoFromGoogleOAuth() throws IOException {
    when(oauth2ProviderRepository.findByProviderAndProviderId(OauthProvider.GOOGLE, "google-provider-id"))
        .thenReturn(Optional.of(oauthConnectionRecord));
    when(oauthCodeService.createCode(accountId)).thenReturn("code");

    oauth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

    assertThat(response.getRedirectedUrl()).isNotNull();
  }

  @Test
  @DisplayName("Should throw when OAuth provider is not supported")
  void shouldThrowWhenProviderNotSupported() throws IOException {
    OAuth2AuthenticationToken unsupportedAuth = new OAuth2AuthenticationToken(oauth2User,
        java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")),
        "unsupported-provider");

    assertThatThrownBy(() -> oauth2SuccessHandler.onAuthenticationSuccess(request, response, unsupportedAuth))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Unsupported OAuth2 provider");
  }

  @Test
  @DisplayName("Should redirect to frontend URL with auth code")
  void shouldRedirectToFrontendUrlWithAuthCode() throws IOException {
    when(oauth2ProviderRepository.findByProviderAndProviderId(OauthProvider.GOOGLE, "google-provider-id"))
        .thenReturn(Optional.of(oauthConnectionRecord));
    when(oauthCodeService.createCode(accountId)).thenReturn("test-code");

    oauth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

    String expectedRedirect = "http://localhost:3000/login/callback?code=test-code";
    assertThat(response.getRedirectedUrl()).isEqualTo(expectedRedirect);
  }
}
