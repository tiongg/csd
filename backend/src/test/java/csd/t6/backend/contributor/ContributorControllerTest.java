package csd.t6.backend.contributor;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import csd.t6.backend.contributor.dto.response.ContributorAnalyticsResponse;
import csd.t6.backend.contributor.dto.response.CourseEngagementData;
import csd.t6.backend.contributor.dto.response.EnrollmentTrendBucket;
import csd.t6.backend.contributor.dto.response.ImageUploadResponse;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@SpringBootTest
@WebAppConfiguration
@ActiveProfiles("test")
@Transactional
class ContributorControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private ContributorService contributorService;

    @MockitoBean
    private ContributorAnalyticsService analyticsService;

    @MockitoBean
    private csd.t6.backend.auth.JwtService jwtService;

    @Autowired
    private csd.t6.backend.account.AccountRepository accountRepository;

    private AccountRecord testAccount;
    private String accessToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        testAccount = accountRepository.insert("contributor@test.com", "contributor", "hash", "Contributor Name");

        // Mock JWT service
        when(jwtService.generateAccessToken(testAccount.getId())).thenReturn("mock_access_token");
        when(jwtService.generateRefreshToken(testAccount.getId())).thenReturn("mock_refresh_token");
        when(jwtService.getRefreshTokenExpirationHours()).thenReturn(720L);
        when(accountRepository.findOneBy(csd.t6.jooq.accounts.tables.Account.ACCOUNT.ID, testAccount.getId()))
                .thenReturn(java.util.Optional.of(testAccount));

        accessToken = "mock_access_token";
    }

    @Test
    @DisplayName("POST /api/contributor/apply - should apply for contributor role")
    void shouldApplyForContributorRole() throws Exception {
        mockMvc.perform(
                post("/api/contributor/apply").header("Authorization", "Bearer " + accessToken).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(contributorService).insertPendingContributor(testAccount.getId());
    }

    @Test
    @DisplayName("GET /api/contributor/image-upload-url - should get image upload URL")
    void shouldGetImageUploadUrl() throws Exception {
        UUID courseId = UUID.randomUUID();
        String extension = "png";

        ImageUploadResponse response = new ImageUploadResponse("https://upload-url.com", "test-key.png",
                "https://public-url.com/test-key.png");

        when(contributorService.getFileUploadUrl(eq(courseId), eq(extension))).thenReturn(response);

        mockMvc.perform(get("/api/contributor/{courseId}/image-upload-url", courseId).param("extension", extension)
                .header("Authorization", "Bearer " + accessToken).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(jsonPath("$.url").value("https://upload-url.com"))
                .andExpect(jsonPath("$.key").value("test-key.png"))
                .andExpect(jsonPath("$.publicUrl").value("https://public-url.com/test-key.png"));

        verify(contributorService).getFileUploadUrl(eq(courseId), eq(extension));
    }

    @Test
    @DisplayName("GET /api/contributor/analytics - should get analytics with default timeframe")
    void shouldGetAnalyticsWithDefaultTimeframe() throws Exception {
        CourseEngagementData engagementData = new CourseEngagementData(10, 5, 3);
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Jan", 5, 0);
        ContributorAnalyticsResponse analyticsResponse = new ContributorAnalyticsResponse(engagementData, List.of(bucket),
                List.of(bucket), 5, 2, 5, 5);

        when(analyticsService.getAnalytics(eq(testAccount.getId()), eq("1M"))).thenReturn(analyticsResponse);

        mockMvc.perform(get("/api/contributor/analytics").header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
                .andExpect(jsonPath("$.engagementSummary.enrolled").value(10))
                .andExpect(jsonPath("$.engagementSummary.active").value(5))
                .andExpect(jsonPath("$.engagementSummary.completed").value(3));

        verify(analyticsService).getAnalytics(eq(testAccount.getId()), eq("1M"));
    }

    @Test
    @DisplayName("GET /api/contributor/analytics - should get analytics with custom timeframe")
    void shouldGetAnalyticsWithCustomTimeframe() throws Exception {
        CourseEngagementData engagementData = new CourseEngagementData(20, 10, 7);
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Jan", 10, 0);
        ContributorAnalyticsResponse analyticsResponse = new ContributorAnalyticsResponse(engagementData, List.of(bucket),
                List.of(bucket), 10, 5, 10, 10);

        when(analyticsService.getAnalytics(eq(testAccount.getId()), eq("3M"))).thenReturn(analyticsResponse);

        mockMvc.perform(get("/api/contributor/analytics").param("timeframe", "3M")
                .header("Authorization", "Bearer " + accessToken).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(jsonPath("$.engagementSummary.enrolled").value(20))
                .andExpect(jsonPath("$.publishedTotal").value(10));

        verify(analyticsService).getAnalytics(eq(testAccount.getId()), eq("3M"));
    }

    @Test
    @DisplayName("GET /api/contributor/analytics - should return 401 without authentication")
    void shouldReturn401WithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/contributor/analytics").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
