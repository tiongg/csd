package csd.t6.backend.contributor;

import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.contributor.dto.response.ContributorAnalyticsResponse;
import csd.t6.backend.contributor.dto.response.CourseEngagementData;
import csd.t6.backend.contributor.dto.response.EnrollmentTrendBucket;

@Service
public class ContributorAnalyticsService {
  private final ContributorAnalyticsRepository repository;

  private static final DateTimeFormatter CHART_DAY_FORMATTER = DateTimeFormatter.ofPattern("dd MMM");
  private static final DateTimeFormatter CHART_MONTH_YEAR_FORMATTER = DateTimeFormatter.ofPattern("MMM ''yy");

  public ContributorAnalyticsService(ContributorAnalyticsRepository repository) {
    this.repository = repository;
  }

  public ContributorAnalyticsResponse getAnalytics(UUID contributorId, String timeframe) {
    OffsetDateTime now = OffsetDateTime.now();
    TimeFrame tf = TimeFrame.fromString(timeframe);
    OffsetDateTime since = tf.calculateSince(now);

    int enrolled = repository.countEnrollmentsByContributor(contributorId, since);
    int completed = repository.countCompletionsByContributor(contributorId, since);
    int active = repository.countActiveLearnersByContributor(contributorId);

    CourseEngagementData engagementSummary = new CourseEngagementData(enrolled, active, completed);

    // Get course updates and build bucketed series
    List<EnrollmentTrendBucket> publishedSeries = buildPublishedSeries(contributorId, since, tf);
    int publishedTotal = publishedSeries.stream().mapToInt(EnrollmentTrendBucket::value).sum();
    int publishedDelta = calculateDelta(publishedSeries);

    // Get enrollment trend
    List<EnrollmentTrendBucket> enrollmentTrend = buildEnrollmentTrend(contributorId, since, tf);
    int latestEnrollmentCount = enrollmentTrend.isEmpty() ? 0 : enrollmentTrend.getLast().value();
    int totalEnrollmentCount = enrollmentTrend.stream().mapToInt(EnrollmentTrendBucket::value).sum();

    return new ContributorAnalyticsResponse(engagementSummary, enrollmentTrend, publishedSeries, publishedTotal,
        publishedDelta, latestEnrollmentCount, totalEnrollmentCount);
  }

  private List<EnrollmentTrendBucket> buildPublishedSeries(UUID contributorId, OffsetDateTime since,
      TimeFrame timeframe) {
    int bucketCount = timeframe.getBucketCount();
    long bucketDurationMs = timeframe.getBucketDurationMs();
    List<EnrollmentTrendBucket> buckets = new ArrayList<>();

    for (int i = 0; i < bucketCount; i++) {
      String label = timeframe.formatLabel(i, bucketCount);
      buckets.add(new EnrollmentTrendBucket(label, 0, 0));
    }

    var updateCounts = repository.getCourseUpdateCountsByContributor(contributorId, since);
    long totalWindowMs = bucketDurationMs * bucketCount;

    for (var record : updateCounts) {
      OffsetDateTime timestamp = record.value1();
      int count = record.value2();
      long ageMs = timestamp.toEpochSecond() * 1000 - (since.toEpochSecond() * 1000);
      if (ageMs < 0 || ageMs >= totalWindowMs) {
        continue;
      }
      int slot = (int) (ageMs / bucketDurationMs);
      int bucketIndex = bucketCount - 1 - slot;
      if (bucketIndex >= 0 && bucketIndex < bucketCount) {
        EnrollmentTrendBucket existing = buckets.get(bucketIndex);
        buckets.set(bucketIndex, new EnrollmentTrendBucket(existing.label(), existing.value() + count, 0));
      }
    }

    return buckets;
  }

  private List<EnrollmentTrendBucket> buildEnrollmentTrend(UUID contributorId, OffsetDateTime since,
      TimeFrame timeframe) {
    int bucketCount = timeframe.getBucketCount();
    long bucketDurationMs = timeframe.getBucketDurationMs();
    List<EnrollmentTrendBucket> buckets = new ArrayList<>();

    for (int i = 0; i < bucketCount; i++) {
      String label = timeframe.formatLabel(i, bucketCount);
      buckets.add(new EnrollmentTrendBucket(label, 0, 0));
    }

    var enrollmentCounts = repository.getEnrollmentCountsByDate(contributorId, since);
    long totalWindowMs = bucketDurationMs * bucketCount;

    for (var record : enrollmentCounts) {
      LocalDate enrolledAt = record.value1().toLocalDate();
      int count = record.value2();
      int uniqueUsers = record.value3();

      long ageMs = ChronoUnit.DAYS.between(since.toLocalDate(), enrolledAt) * 24 * 60 * 60 * 1000;
      if (ageMs < 0 || ageMs >= totalWindowMs) {
        continue;
      }
      int slot = (int) (ageMs / bucketDurationMs);
      int bucketIndex = bucketCount - 1 - slot;
      if (bucketIndex >= 0 && bucketIndex < bucketCount) {
        EnrollmentTrendBucket existing = buckets.get(bucketIndex);
        buckets.set(bucketIndex,
            new EnrollmentTrendBucket(existing.label(), existing.value() + uniqueUsers, existing.attempts() + count));
      }
    }

    return buckets;
  }

  private int calculateDelta(List<EnrollmentTrendBucket> series) {
    int total = series.stream().mapToInt(EnrollmentTrendBucket::value).sum();
    int midPoint = Math.max(1, series.size() / 2);
    int firstHalfTotal = series.subList(0, midPoint).stream().mapToInt(EnrollmentTrendBucket::value).sum();
    return total - firstHalfTotal;
  }

  private enum TimeFrame {
    WEEK_1("1W", 7, 24 * 60 * 60 * 1000L), MONTH_1("1M", 5, 7L * 24 * 60 * 60 * 1000),
    MONTHS_3("3M", 12, 7L * 24 * 60 * 60 * 1000), YEAR_1("1Y", 12, 30L * 24 * 60 * 60 * 1000);

    private final String value;
    private final int bucketCount;
    private final long bucketDurationMs;

    TimeFrame(String value, int bucketCount, long bucketDurationMs) {
      this.value = value;
      this.bucketCount = bucketCount;
      this.bucketDurationMs = bucketDurationMs;
    }

    public int getBucketCount() {
      return bucketCount;
    }

    public long getBucketDurationMs() {
      return bucketDurationMs;
    }

    public OffsetDateTime calculateSince(OffsetDateTime now) {
      long totalMs = bucketDurationMs * bucketCount;
      return now.minus(Duration.ofMillis(totalMs));
    }

    public String formatLabel(int index, int count) {
      LocalDate now = LocalDate.now();

      if (this == WEEK_1) {
        int daysAgo = count - 1 - index;
        LocalDate date = now.minusDays(daysAgo);
        return date.format(CHART_DAY_FORMATTER);
      }
      if (this == MONTH_1 || this == MONTHS_3) {
        int weeksAgo = count - 1 - index;
        LocalDate date = now.minusWeeks(weeksAgo);
        return date.format(CHART_DAY_FORMATTER);
      }
      if (this == YEAR_1) {
        int monthsAgo = count - 1 - index;
        LocalDate date = now.minusMonths(monthsAgo);
        return date.format(CHART_MONTH_YEAR_FORMATTER);
      }
      return now.format(CHART_MONTH_YEAR_FORMATTER);
    }

    public static TimeFrame fromString(String value) {
      for (TimeFrame tf : values()) {
        if (tf.value.equals(value)) {
          return tf;
        }
      }
      return MONTH_1; // default
    }
  }
}
