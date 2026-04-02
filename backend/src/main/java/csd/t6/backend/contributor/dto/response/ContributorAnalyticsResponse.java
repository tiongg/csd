package csd.t6.backend.contributor.dto.response;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record ContributorAnalyticsResponse(
    @NotNull CourseEngagementData engagementSummary,
    @NotNull List<EnrollmentTrendBucket> enrollmentTrend,
    @NotNull List<EnrollmentTrendBucket> publishedSeries,
    @NotNull Integer publishedTotal,
    @NotNull Integer publishedDelta,
    @NotNull Integer latestEnrollmentCount,
    @NotNull Integer totalEnrollmentCount
) {}
