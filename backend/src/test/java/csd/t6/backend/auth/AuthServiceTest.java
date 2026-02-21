package csd.t6.backend.auth;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.auth.dto.response.TokenDataResponse;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private UUID testAccountId;
    private AccountRecord mockAccount;

    @BeforeEach
    void setUp() {
        testAccountId = UUID.randomUUID();
        mockAccount = mock(AccountRecord.class);
    }

    @Test
    @DisplayName("Should generate token data with access token, account, and cookie")
    void shouldGenerateTokenData() {
        when(jwtService.generateAccessToken(testAccountId)).thenReturn("access_token_value");
        when(jwtService.generateRefreshToken(testAccountId)).thenReturn("refresh_token_value");
        when(jwtService.getRefreshTokenExpirationHours()).thenReturn(720L);
        when(accountRepository.findOneBy(ACCOUNT.ID, testAccountId)).thenReturn(Optional.of(mockAccount));

        TokenDataResponse response = authService.generateTokenData(testAccountId);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("access_token_value");
        assertThat(response.account()).isEqualTo(mockAccount);
        assertThat(response.refreshCookie()).isNotNull();
        assertThat(response.refreshCookie().getName()).isEqualTo("refresh_token");
        assertThat(response.refreshCookie().getValue()).isEqualTo("refresh_token_value");
        assertThat(response.refreshCookie().isHttpOnly()).isTrue();
        assertThat(response.refreshCookie().getMaxAge()).isEqualTo(720 * 3600);
    }

    @Test
    @DisplayName("Should return logout cookie with empty value and maxAge 0")
    void shouldReturnLogoutCookie() {
        Cookie logoutCookie = authService.getLogoutCookie();

        assertThat(logoutCookie.getName()).isEqualTo("refresh_token");
        assertThat(logoutCookie.getValue()).isEmpty();
        assertThat(logoutCookie.getMaxAge()).isEqualTo(0);
        assertThat(logoutCookie.isHttpOnly()).isTrue();
    }

    @Test
    @DisplayName("Should return null account when account not found during token generation")
    void shouldHandleMissingAccount() {
        when(jwtService.generateAccessToken(testAccountId)).thenReturn("access_token");
        when(jwtService.generateRefreshToken(testAccountId)).thenReturn("refresh_token");
        when(jwtService.getRefreshTokenExpirationHours()).thenReturn(720L);
        when(accountRepository.findOneBy(ACCOUNT.ID, testAccountId)).thenReturn(Optional.empty());

        TokenDataResponse response = authService.generateTokenData(testAccountId);

        assertThat(response.account()).isNull();
    }
}