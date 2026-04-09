package csd.t6.backend.contributor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.contributor.dto.response.ContributorAnalyticsResponse;

@ExtendWith(MockitoExtension.class)
class ContributorAnalyticsServiceTest {

    @Mock
    private ContributorAnalyticsRepository repository;

    @InjectMocks
    private ContributorAnalyticsService analyticsService;

    private UUID contributorId;

    @BeforeEach
    void setUp() {
        contributorId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should get analytics with 1M timeframe")
    void shouldGetAnalyticsWith1MTimeframe() {
        when(repository.countEnrollmentsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(10);
        when(repository.countCompletionsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(5);
        when(repository.countActiveLearnersByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(3);
        when(repository.getCourseUpdateCountsByContributor(eq(contributorId), any(OffsetDateTime.class)))
                .thenReturn(List.of());
        when(repository.getEnrollmentCountsByDate(eq(contributorId), any(OffsetDateTime.class))).thenReturn(List.of());

        ContributorAnalyticsResponse response = analyticsService.getAnalytics(contributorId, "1M");

        assertThat(response).isNotNull();
        assertThat(response.engagementSummary()).isNotNull();
        assertThat(response.engagementSummary().enrolled()).isEqualTo(10);
        assertThat(response.engagementSummary().active()).isEqualTo(3);
        assertThat(response.engagementSummary().completed()).isEqualTo(5);
        assertThat(response.publishedSeries()).hasSize(5);
        assertThat(response.enrollmentTrend()).hasSize(5);
        assertThat(response.publishedTotal()).isEqualTo(0);
        assertThat(response.publishedDelta()).isEqualTo(0);
        assertThat(response.latestEnrollmentCount()).isEqualTo(0);
        assertThat(response.totalEnrollmentCount()).isEqualTo(0);

        verify(repository).countEnrollmentsByContributor(eq(contributorId), any(OffsetDateTime.class));
        verify(repository).countCompletionsByContributor(eq(contributorId), any(OffsetDateTime.class));
        verify(repository).countActiveLearnersByContributor(eq(contributorId), any(OffsetDateTime.class));
    }

    @Test
    @DisplayName("Should get analytics with 1W timeframe")
    void shouldGetAnalyticsWith1WTimeframe() {
        when(repository.countEnrollmentsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(10);
        when(repository.countCompletionsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(5);
        when(repository.countActiveLearnersByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(3);
        when(repository.getCourseUpdateCountsByContributor(eq(contributorId), any(OffsetDateTime.class)))
                .thenReturn(List.of());
        when(repository.getEnrollmentCountsByDate(eq(contributorId), any(OffsetDateTime.class))).thenReturn(List.of());

        ContributorAnalyticsResponse response = analyticsService.getAnalytics(contributorId, "1W");

        assertThat(response).isNotNull();
        assertThat(response.publishedSeries()).hasSize(7);
        assertThat(response.enrollmentTrend()).hasSize(7);
    }

    @Test
    @DisplayName("Should get analytics with 3M timeframe")
    void shouldGetAnalyticsWith3MTimeframe() {
        when(repository.countEnrollmentsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(10);
        when(repository.countCompletionsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(5);
        when(repository.countActiveLearnersByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(3);
        when(repository.getCourseUpdateCountsByContributor(eq(contributorId), any(OffsetDateTime.class)))
                .thenReturn(List.of());
        when(repository.getEnrollmentCountsByDate(eq(contributorId), any(OffsetDateTime.class))).thenReturn(List.of());

        ContributorAnalyticsResponse response = analyticsService.getAnalytics(contributorId, "3M");

        assertThat(response).isNotNull();
        assertThat(response.publishedSeries()).hasSize(12);
        assertThat(response.enrollmentTrend()).hasSize(12);
    }

    @Test
    @DisplayName("Should get analytics with 1Y timeframe")
    void shouldGetAnalyticsWith1YTimeframe() {
        when(repository.countEnrollmentsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(10);
        when(repository.countCompletionsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(5);
        when(repository.countActiveLearnersByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(3);
        when(repository.getCourseUpdateCountsByContributor(eq(contributorId), any(OffsetDateTime.class)))
                .thenReturn(List.of());
        when(repository.getEnrollmentCountsByDate(eq(contributorId), any(OffsetDateTime.class))).thenReturn(List.of());

        ContributorAnalyticsResponse response = analyticsService.getAnalytics(contributorId, "1Y");

        assertThat(response).isNotNull();
        assertThat(response.publishedSeries()).hasSize(12);
        assertThat(response.enrollmentTrend()).hasSize(12);
    }

    @Test
    @DisplayName("Should default to 1M timeframe for invalid timeframe")
    void shouldDefaultTo1MForInvalidTimeframe() {
        when(repository.countEnrollmentsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(10);
        when(repository.countCompletionsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(5);
        when(repository.countActiveLearnersByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(3);
        when(repository.getCourseUpdateCountsByContributor(eq(contributorId), any(OffsetDateTime.class)))
                .thenReturn(List.of());
        when(repository.getEnrollmentCountsByDate(eq(contributorId), any(OffsetDateTime.class))).thenReturn(List.of());

        ContributorAnalyticsResponse response = analyticsService.getAnalytics(contributorId, "invalid");

        assertThat(response).isNotNull();
        assertThat(response.publishedSeries()).hasSize(5); // 1M default
        assertThat(response.enrollmentTrend()).hasSize(5);
    }

    @Test
    @DisplayName("Should handle empty course update counts")
    void shouldHandleEmptyCourseUpdateCounts() {
        when(repository.countEnrollmentsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(10);
        when(repository.countCompletionsByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(5);
        when(repository.countActiveLearnersByContributor(eq(contributorId), any(OffsetDateTime.class))).thenReturn(3);
        when(repository.getCourseUpdateCountsByContributor(eq(contributorId), any(OffsetDateTime.class)))
                .thenReturn(List.of());
        when(repository.getEnrollmentCountsByDate(eq(contributorId), any(OffsetDateTime.class))).thenReturn(List.of());

        ContributorAnalyticsResponse response = analyticsService.getAnalytics(contributorId, "1M");

        assertThat(response).isNotNull();
        assertThat(response.publishedTotal()).isEqualTo(0);
        assertThat(response.publishedDelta()).isEqualTo(0);
        assertThat(response.latestEnrollmentCount()).isEqualTo(0);
        assertThat(response.totalEnrollmentCount()).isEqualTo(0);
    }
}
