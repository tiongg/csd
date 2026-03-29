package csd.t6.backend.auth.oauth;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import csd.t6.backend.account.AccountService;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.enums.OauthProvider;
import csd.t6.jooq.accounts.tables.records.OauthConnectionRecord;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

record OAuth2UserInfo(String providerId, String name, String email, String pictureUrl) {}

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
  @Value("${FRONTEND_URL:http://localhost:3000}")
  private String frontendUrl;

  private final OAuth2ProviderRepository oauth2ProviderRepository;
  private final OAuthCodeService oauthCodeService;
  private final AccountService accountService;

  public OAuth2SuccessHandler(OAuthCodeService oauthCodeService, AccountService accountService,
      OAuth2ProviderRepository oauth2ProviderRepository) {
    this.oauthCodeService = oauthCodeService;
    this.accountService = accountService;
    this.oauth2ProviderRepository = oauth2ProviderRepository;
  }

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException {

    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
    OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

    OauthProvider provider = OauthProvider.lookupLiteral(oauthToken.getAuthorizedClientRegistrationId().toUpperCase());
    if (provider == null) {
      throw new BadRequestException("Unsupported OAuth2 provider");
    }

    OAuth2UserInfo userInfo = extractUserInfo(provider, oAuth2User);

    OauthConnectionRecord account = this.oauth2ProviderRepository
        .findByProviderAndProviderId(provider, userInfo.providerId()).orElseGet(() -> this.accountService
            .createWithOAuthLogin(userInfo.email(), userInfo.name(), provider, userInfo.providerId(),
                userInfo.pictureUrl()));

    String code = oauthCodeService.createCode(account.getAccountId());
    String redirectUrl = String.format("%s/login/callback?code=%s", frontendUrl, code);

    getRedirectStrategy().sendRedirect(request, response, redirectUrl);
  }

  private OAuth2UserInfo extractUserInfo(OauthProvider provider, OAuth2User oAuth2User) {
    switch (provider) {
    case GOOGLE -> {
      String providerId = oAuth2User.getAttribute("sub");
      String name = oAuth2User.getAttribute("name");
      String email = oAuth2User.getAttribute("email");
      String pictureUrl = oAuth2User.getAttribute("picture");
      return new OAuth2UserInfo(providerId, name, email, pictureUrl);
    }
    }

    throw new BadRequestException("Unsupported OAuth2 provider");
  }
}
