import type { Course } from '@/lib/utils';
import {
  hashString,
  releaseBucketCount,
  releaseBucketLabel,
  timeframeFactor,
  type EngagementSummary,
  type QuizScoreBucket,
  type RankedCourse,
  type ReleaseBucket,
  type Timeframe,
} from './contributor-utils';

export function rankCourses(courses: Course[], timeframe: Timeframe): RankedCourse[] {
  return courses.map((course, index) => {
    const seed = hashString(`${course.id}-${course.title}-${course.updatedAt}`);
    const baseEnrollments = 80 + (seed % 320) + index * 7;
    const activityMultiplier = timeframeFactor(timeframe);
    const updatedAt = new Date(course.updatedAt);
    const daysSinceUpdate = Math.max(
      0,
      Math.round((Date.now() - updatedAt.getTime()) / 86_400_000),
    );
    const recencyBoost =
      timeframe === '1W'
        ? Math.max(0.55, 1.28 - daysSinceUpdate * 0.035)
        : timeframe === '1M'
          ? Math.max(0.7, 1.2 - daysSinceUpdate * 0.01)
          : timeframe === '1Y'
            ? Math.max(0.78, 1.12 - daysSinceUpdate * 0.0012)
            : 1;
    const enrollments = Math.max(
      8,
      Math.round(baseEnrollments * activityMultiplier * recencyBoost),
    );
    const completionRate = 0.32 + ((seed >> 3) % 26) / 100;
    const qualityBoost = 0.9 + ((seed >> 7) % 12) / 100;
    const completions = Math.min(
      enrollments,
      Math.max(3, Math.round(enrollments * completionRate * qualityBoost)),
    );

    return {
      courseId: course.id,
      title: course.title,
      enrollments,
      completions,
    };
  });
}

export function buildCourseCountBuckets(
  courses: Course[],
  timeframe: Timeframe,
  dateSelector: (course: Course) => string,
) {
  const bucketCount = releaseBucketCount(timeframe);
  const buckets: ReleaseBucket[] = Array.from(
    { length: bucketCount },
    (_, index) => ({
      label: releaseBucketLabel(index, bucketCount, timeframe),
      value: 0,
    }),
  );

  const now = Date.now();
  const bucketDurationMs =
    timeframe === '1W'
      ? 24 * 60 * 60 * 1000
      : timeframe === '1M'
        ? 7 * 24 * 60 * 60 * 1000
        : timeframe === '3M'
          ? 7 * 24 * 60 * 60 * 1000
          : timeframe === '1Y'
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;
  const totalWindowMs = bucketDurationMs * bucketCount;

  courses.forEach((course) => {
    const timestamp = new Date(dateSelector(course)).getTime();
    if (Number.isNaN(timestamp)) return;
    const ageMs = now - timestamp;
    if (ageMs < 0 || ageMs >= totalWindowMs) return;
    const slot = Math.floor(ageMs / bucketDurationMs);
    const bucketIndex = bucketCount - 1 - slot;
    if (bucketIndex >= 0 && bucketIndex < bucketCount) {
      buckets[bucketIndex]!.value += 1;
    }
  });

  return buckets;
}

export function buildQuizScoreTrend(
  rankedCourses: RankedCourse[],
  timeframe: Timeframe,
): QuizScoreBucket[] {
  const bucketCount = releaseBucketCount(timeframe);
  return Array.from({ length: bucketCount }, (_, index) => {
    let weightedScore = 0;
    let attempts = 0;
    rankedCourses.forEach((course, courseIndex) => {
      const seed = hashString(
        `${course.courseId}-${course.title}-${timeframe}-${courseIndex}`,
      );
      const completionRatio =
        course.enrollments > 0 ? course.completions / course.enrollments : 0;
      const baseScore = Math.round(
        Math.max(45, Math.min(95, 52 + completionRatio * 40 + (seed % 6))),
      );
      const trendDrift = ((seed >> 3) % 9) - 4;
      const score = Math.max(
        35,
        Math.min(
          98,
          Math.round(
            baseScore + (index - (bucketCount - 1) / 2) * trendDrift * 0.6,
          ),
        ),
      );
      const bucketAttempts = 1 + ((seed + index) % 5);
      weightedScore += score * bucketAttempts;
      attempts += bucketAttempts;
    });

    return {
      label: releaseBucketLabel(index, bucketCount, timeframe),
      score:
        attempts > 0 ? Math.round((weightedScore / attempts) * 10) / 10 : 0,
      attempts,
    };
  });
}

export function buildEngagementSummary(
  rankedCourses: RankedCourse[],
): EngagementSummary {
  const totalEnrollments = rankedCourses.reduce(
    (sum, course) => sum + course.enrollments,
    0,
  );
  const totalCompletions = rankedCourses.reduce(
    (sum, course) => sum + course.completions,
    0,
  );
  const activeLearners = Math.max(
    totalCompletions,
    Math.round(totalEnrollments * 0.56),
  );
  const funnelRows = [
    { label: 'Enrolled', value: totalEnrollments, color: '#0ea5e9' },
    { label: 'Active', value: activeLearners, color: '#38bdf8' },
    { label: 'Completed', value: totalCompletions, color: '#7dd3fc' },
  ];

  return {
    totalEnrollments,
    activeLearners,
    totalCompletions,
    funnelRows,
    maxFunnelValue: Math.max(1, ...funnelRows.map((row) => row.value)),
  };
}
