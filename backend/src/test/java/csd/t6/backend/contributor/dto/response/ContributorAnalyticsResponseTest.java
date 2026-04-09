package csd.t6.backend.contributor.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ContributorAnalyticsResponseTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid contributor analytics response")
    void shouldCreateValidContributorAnalyticsResponse() {
        CourseEngagementData engagementSummary = new CourseEngagementData(10, 5, 3);
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Jan", 5, 2);
        List<EnrollmentTrendBucket> enrollmentTrend = List.of(bucket);
        List<EnrollmentTrendBucket> publishedSeries = List.of(bucket);

        ContributorAnalyticsResponse response = new ContributorAnalyticsResponse(engagementSummary, enrollmentTrend,
                publishedSeries, 5, 2, 5, 5);

        assertThat(response.engagementSummary()).isEqualTo(engagementSummary);
        assertThat(response.enrollmentTrend()).hasSize(1);
        assertThat(response.publishedSeries()).hasSize(1);
        assertThat(response.publishedTotal()).isEqualTo(5);
        assertThat(response.publishedDelta()).isEqualTo(2);
        assertThat(response.latestEnrollmentCount()).isEqualTo(5);
        assertThat(response.totalEnrollmentCount()).isEqualTo(5);
    }

    @Test
    @DisplayName("Should validate required fields")
    void shouldValidateRequiredFields() {
        ContributorAnalyticsResponse response = new ContributorAnalyticsResponse(null, null, null, null, null, null, null);

        Set<ConstraintViolation<ContributorAnalyticsResponse>> violations = validator.validate(response);

        assertThat(violations).hasSize(7);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("engagementSummary"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("enrollmentTrend"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("publishedSeries"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("publishedTotal"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("publishedDelta"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("latestEnrollmentCount"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("totalEnrollmentCount"));
    }

    @Test
    @DisplayName("Should create response with empty trend data")
    void shouldCreateResponseWithEmptyTrendData() {
        CourseEngagementData engagementSummary = new CourseEngagementData(0, 0, 0);
        List<EnrollmentTrendBucket> emptyTrend = List.of();

        ContributorAnalyticsResponse response = new ContributorAnalyticsResponse(engagementSummary, emptyTrend, emptyTrend,
                0, 0, 0, 0);

        Set<ConstraintViolation<ContributorAnalyticsResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.enrollmentTrend()).isEmpty();
        assertThat(response.publishedSeries()).isEmpty();
        assertThat(response.publishedTotal()).isEqualTo(0);
        assertThat(response.publishedDelta()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should create response with multiple trend buckets")
    void shouldCreateResponseWithMultipleTrendBuckets() {
        CourseEngagementData engagementSummary = new CourseEngagementData(20, 10, 5);
        EnrollmentTrendBucket bucket1 = new EnrollmentTrendBucket("Jan", 5, 2);
        EnrollmentTrendBucket bucket2 = new EnrollmentTrendBucket("Feb", 7, 3);
        EnrollmentTrendBucket bucket3 = new EnrollmentTrendBucket("Mar", 8, 3);
        List<EnrollmentTrendBucket> trendData = List.of(bucket1, bucket2, bucket3);

        ContributorAnalyticsResponse response = new ContributorAnalyticsResponse(engagementSummary, trendData, trendData, 20,
                10, 8, 20);

        assertThat(response.enrollmentTrend()).hasSize(3);
        assertThat(response.publishedSeries()).hasSize(3);
        assertThat(response.enrollmentTrend().get(0).label()).isEqualTo("Jan");
        assertThat(response.totalEnrollmentCount()).isEqualTo(20);
    }

    @Test
    @DisplayName("Should handle large numbers")
    void shouldHandleLargeNumbers() {
        CourseEngagementData engagementSummary = new CourseEngagementData(1000, 500, 250);
        List<EnrollmentTrendBucket> trendData = List.of();

        ContributorAnalyticsResponse response = new ContributorAnalyticsResponse(engagementSummary, trendData, trendData,
                1000, 500, 300, 1500);

        assertThat(response.engagementSummary().enrolled()).isEqualTo(1000);
        assertThat(response.engagementSummary().active()).isEqualTo(500);
        assertThat(response.engagementSummary().completed()).isEqualTo(250);
        assertThat(response.totalEnrollmentCount()).isEqualTo(1500);
    }

    @Test
    @DisplayName("Should handle zero values")
    void shouldHandleZeroValues() {
        CourseEngagementData engagementSummary = new CourseEngagementData(0, 0, 0);
        List<EnrollmentTrendBucket> trendData = List.of();

        ContributorAnalyticsResponse response = new ContributorAnalyticsResponse(engagementSummary, trendData, trendData, 0,
                0, 0, 0);

        assertThat(response.engagementSummary().enrolled()).isEqualTo(0);
        assertThat(response.engagementSummary().active()).isEqualTo(0);
        assertThat(response.engagementSummary().completed()).isEqualTo(0);
        assertThat(response.publishedTotal()).isEqualTo(0);
        assertThat(response.publishedDelta()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle negative delta values")
    void shouldHandleNegativeDeltaValues() {
        CourseEngagementData engagementSummary = new CourseEngagementData(10, 5, 3);
        List<EnrollmentTrendBucket> trendData = List.of();

        ContributorAnalyticsResponse response = new ContributorAnalyticsResponse(engagementSummary, trendData, trendData,
                10, -5, 3, 10);

        assertThat(response.publishedDelta()).isEqualTo(-5);
    }
}
