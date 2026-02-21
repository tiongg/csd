package csd.t6.backend.auth;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    private UUID testAccountId;

    @BeforeEach
    void setUp() {
        testAccountId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should generate valid access token")
    void shouldGenerateValidAccessToken() {
        String token = jwtService.generateAccessToken(testAccountId);

        assertThat(token).isNotNull().isNotEmpty();
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Should generate valid refresh token")
    void shouldGenerateValidRefreshToken() {
        String token = jwtService.generateRefreshToken(testAccountId);

        assertThat(token).isNotNull().isNotEmpty();
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Should extract correct account ID from access token")
    void shouldExtractAccountIdFromAccessToken() {
        String token = jwtService.generateAccessToken(testAccountId);
        UUID extractedId = jwtService.extractAccountId(token);

        assertThat(extractedId).isEqualTo(testAccountId);
    }

    @Test
    @DisplayName("Should extract correct account ID from refresh token")
    void shouldExtractAccountIdFromRefreshToken() {
        String token = jwtService.generateRefreshToken(testAccountId);
        UUID extractedId = jwtService.extractAccountId(token);

        assertThat(extractedId).isEqualTo(testAccountId);
    }

    @Test
    @DisplayName("Should return false for null token")
    void shouldReturnFalseForNullToken() {
        assertThat(jwtService.isTokenValid(null)).isFalse();
    }

    @Test
    @DisplayName("Should return false for empty token")
    void shouldReturnFalseForEmptyToken() {
        assertThat(jwtService.isTokenValid("")).isFalse();
    }

    @Test
    @DisplayName("Should return false for malformed token")
    void shouldReturnFalseForMalformedToken() {
        assertThat(jwtService.isTokenValid("not.a.valid.token")).isFalse();
    }

    @Test
    @DisplayName("Should return false for tampered token")
    void shouldReturnFalseForTamperedToken() {
        String token = jwtService.generateAccessToken(testAccountId);
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";

        assertThat(jwtService.isTokenValid(tampered)).isFalse();
    }

    @Test
    @DisplayName("Should generate different tokens for different accounts")
    void shouldGenerateDifferentTokensForDifferentAccounts() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();

        String token1 = jwtService.generateAccessToken(id1);
        String token2 = jwtService.generateAccessToken(id2);

        assertThat(token1).isNotEqualTo(token2);
        assertThat(jwtService.extractAccountId(token1)).isEqualTo(id1);
        assertThat(jwtService.extractAccountId(token2)).isEqualTo(id2);
    }

    @Test
    @DisplayName("Should have positive expiration hours for access token")
    void shouldHavePositiveAccessTokenExpiration() {
        assertThat(jwtService.getAccessTokenExpirationHours()).isPositive();
    }

    @Test
    @DisplayName("Should have positive expiration hours for refresh token")
    void shouldHavePositiveRefreshTokenExpiration() {
        assertThat(jwtService.getRefreshTokenExpirationHours()).isPositive();
    }

    @Test
    @DisplayName("Refresh token should expire later than access token")
    void refreshTokenShouldExpireLaterThanAccessToken() {
        assertThat(jwtService.getRefreshTokenExpirationHours())
            .isGreaterThan(jwtService.getAccessTokenExpirationHours());
    }
}