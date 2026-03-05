package csd.t6.backend.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashMap;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.auth.oauth.OAuthCodeService;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import jakarta.servlet.http.Cookie;

@SpringBootTest
@WebAppConfiguration
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private OAuthCodeService oauthCodeService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AccountRepository accountRepository;

    private AccountRecord testAccount;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()) // <-- this is the key fix
                .build();

        testAccount = accountRepository.insert("authtest@example.com", "authuser", "$2a$12$dummyhashedpassword123456");
    }

    @Test
    @DisplayName("POST /api/auth/login - should login successfully")
    void shouldLoginSuccessfully() throws Exception {
        AuthUserDetails userDetails = new AuthUserDetails(testAccount);
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null,
                userDetails.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authToken);

        String body = objectMapper.writeValueAsString(new HashMap<>() {
            {
                put("usernameOrEmail", "authuser");
                put("password", "password");
            }
        });

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.account.username").value("authuser"))
                .andExpect(cookie().exists("refresh_token"));
    }

    @Test
    @DisplayName("POST /api/auth/login - should return 401 for invalid credentials")
    void shouldReturn400ForInvalidCredentials() throws Exception {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        String body = objectMapper.writeValueAsString(new HashMap<>() {
            {
                put("usernameOrEmail", "wrong");
                put("password", "wrong");
            }
        });

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized()); // changed from isBadRequest()
    }

    @Test
    @DisplayName("POST /api/auth/logout - should clear refresh cookie")
    void shouldLogout() throws Exception {
        String accessToken = jwtService.generateAccessToken(testAccount.getId());

        mockMvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent()).andExpect(cookie().maxAge("refresh_token", 0));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - should return new tokens with valid cookie")
    void shouldRefreshWithValidCookie() throws Exception {
        String refreshToken = jwtService.generateRefreshToken(testAccount.getId());

        mockMvc.perform(post("/api/auth/refresh").cookie(new Cookie("refresh_token", refreshToken)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(cookie().exists("refresh_token"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - should return 400 with missing cookie")
    void shouldReturn400WithMissingRefreshCookie() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")).andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/refresh - should return 400 with invalid cookie")
    void shouldReturn400WithInvalidRefreshCookie() throws Exception {
        mockMvc.perform(post("/api/auth/refresh").cookie(new Cookie("refresh_token", "invalid_token")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/auth/me - should return current user")
    void shouldReturnCurrentUser() throws Exception {
        String accessToken = jwtService.generateAccessToken(testAccount.getId());

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + accessToken)).andExpect(status().isOk())
                .andExpect(jsonPath("$.account.email").value("authtest@example.com"))
                .andExpect(jsonPath("$.account.username").value("authuser"));
    }

    @Test
    @DisplayName("GET /api/auth/me - should return 401 without token")
    void shouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/exchange - should exchange code for tokens")
    void shouldExchangeCodeForTokens() throws Exception {
        UUID accountId = testAccount.getId();
        when(oauthCodeService.consumeCode("valid_code")).thenReturn(accountId);

        String body = objectMapper.writeValueAsString(new HashMap<>() {
            {
                put("code", "valid_code");
            }
        });

        mockMvc.perform(post("/api/auth/exchange").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/auth/exchange - should return 400 for invalid code")
    void shouldReturn400ForInvalidCode() throws Exception {
        when(oauthCodeService.consumeCode("bad_code")).thenThrow(new BadRequestException("Invalid or expired code"));

        String body = objectMapper.writeValueAsString(new HashMap<>() {
            {
                put("code", "bad_code");
            }
        });

        mockMvc.perform(post("/api/auth/exchange").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }
}