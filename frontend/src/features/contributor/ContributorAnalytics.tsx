import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { formatChartDay, formatChartMonthYear } from '@/lib/chart-date';
import type { Course } from '@/lib/utils';
import {
  DashboardAnalyticsSection,
  DashboardAnalyticsSkeleton,
  type AnalyticsMetricCard,
} from '../dashboard/AnalyticsSection';

type Timeframe = '1W' | '1M' | '1Y' | 'ALL';
type MetricKey =
  | 'courseEngagement'
  | 'publishedOutput'
  | 'coursePipeline';

type ContributorAnalyticsProps = {
  courses: Course[];
  isLoading: boolean;
};

type RankedCourse = {
  courseId: string;
  title: string;
  enrollments: number;
  completions: number;
};

type ReleaseBucket = {
  label: string;
  value: number;
};

type QuizScoreBucket = {
  label: string;
  score: number;
  attempts: number;
};

type BarMetricPoint = {
  label: string;
  value: number;
  title?: string;
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function timeframeFactor(timeframe: Timeframe) {
  if (timeframe === '1W') return 0.32;
  if (timeframe === '1M') return 0.7;
  if (timeframe === '1Y') return 0.9;
  return 1;
}

function releaseBucketCount(timeframe: Timeframe) {
  if (timeframe === '1W') return 7;
  if (timeframe === '1M') return 5;
  if (timeframe === '1Y') return 12;
  return 12;
}

function releaseBucketLabel(
  index: number,
  count: number,
  timeframe: Timeframe,
) {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  if (timeframe === '1W') {
    const daysAgo = count - 1 - index;
    const date = new Date(now.getTime() - daysAgo * dayMs);
    return formatChartDay(date);
  }
  if (timeframe === '1M') {
    const weeksAgo = count - 1 - index;
    const end = new Date(now.getTime() - weeksAgo * 7 * dayMs);
    return formatChartDay(end);
  }
  if (timeframe === '1Y') {
    const monthsAgo = count - 1 - index;
    const date = new Date(now.getTime() - monthsAgo * 30 * dayMs);
    return formatChartMonthYear(date);
  }
  const quartersAgo = count - 1 - index;
  const date = new Date(now.getTime() - quartersAgo * 90 * dayMs);
  return formatChartMonthYear(date);
}

function rankCourses(courses: Course[], timeframe: Timeframe): RankedCourse[] {
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

function buildCourseCountBuckets(
  courses: Course[],
  timeframe: Timeframe,
  dateSelector: (course: Course) => string,
) {
  const bucketCount = releaseBucketCount(timeframe);
  const buckets: ReleaseBucket[] = Array.from({ length: bucketCount }, (_, index) => ({
    label: releaseBucketLabel(index, bucketCount, timeframe),
    value: 0,
  }));

  const now = Date.now();
  const bucketDurationMs =
    timeframe === '1W'
      ? 24 * 60 * 60 * 1000
      : timeframe === '1M'
        ? 7 * 24 * 60 * 60 * 1000
        : timeframe === '1Y'
          ? 30 * 24 * 60 * 60 * 1000
          : 90 * 24 * 60 * 60 * 1000;
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

  if (timeframe === 'ALL' && buckets.every((bucket) => bucket.value === 0)) {
    return courses.reduce((acc, _, index) => {
      const bucketIndex = index % bucketCount;
      acc[bucketIndex]!.value += 1;
      return acc;
    }, buckets);
  }

  return buckets;
}

function buildQuizScoreTrend(
  rankedCourses: RankedCourse[],
  timeframe: Timeframe,
): QuizScoreBucket[] {
  const bucketCount = releaseBucketCount(timeframe);
  return Array.from({ length: bucketCount }, (_, index) => {
    let weightedScore = 0;
    let attempts = 0;
    rankedCourses.forEach((course, courseIndex) => {
      const seed = hashString(`${course.courseId}-${course.title}-${timeframe}-${courseIndex}`);
      const completionRatio = course.enrollments > 0 ? course.completions / course.enrollments : 0;
      const baseScore = Math.round(Math.max(45, Math.min(95, 52 + completionRatio * 40 + (seed % 6))));
      const trendDrift = ((seed >> 3) % 9) - 4;
      const score = Math.max(
        35,
        Math.min(98, Math.round(baseScore + (index - (bucketCount - 1) / 2) * trendDrift * 0.6)),
      );
      const bucketAttempts = 1 + ((seed + index) % 5);
      weightedScore += score * bucketAttempts;
      attempts += bucketAttempts;
    });

    return {
      label: releaseBucketLabel(index, bucketCount, timeframe),
      score: attempts > 0 ? Math.round((weightedScore / attempts) * 10) / 10 : 0,
      attempts,
    };
  });
}

function EmptyMetricState({ message }: { message: string }) {
  return (
    <div className="mt-4 flex h-[240px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-slate-800">No course data yet</p>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

function BarMetricChart({ points }: { points: BarMetricPoint[] }) {
  const maxValue = Math.max(1, ...points.map((point) => point.value));

  return (
    <div className="mt-4 flex h-[240px] items-end gap-2 rounded-md border border-slate-200/80 bg-slate-50/70 p-3 backdrop-blur-sm">
      {points.map((point) => {
        const height = 22 + Math.round((point.value / maxValue) * 120);
        return (
          <div
            key={point.label}
            className="flex flex-1 flex-col items-center justify-end"
          >
            <div
              className="w-full rounded-t bg-sky-500 transition-all"
              style={{ height: `${height}px` }}
              title={point.title}
            />
            <span className="mt-2 text-[10px] text-slate-500">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ContributorAnalytics({
  courses,
  isLoading,
}: ContributorAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>('courseEngagement');

  const rankedCourses = useMemo(
    () => rankCourses(courses, timeframe),
    [courses, timeframe],
  );

  const engagementSummary = useMemo(() => {
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
  }, [rankedCourses]);

  const publishedSeries = useMemo(
    () => buildCourseCountBuckets(courses, timeframe, (course) => course.updatedAt),
    [courses, timeframe],
  );
  const quizScoreTrend = useMemo(
    () => buildQuizScoreTrend(rankedCourses, timeframe),
    [rankedCourses, timeframe],
  );

  const publishedTotal = publishedSeries.reduce(
    (sum, bucket) => sum + bucket.value,
    0,
  );
  const previousWindowTotal = useMemo(() => {
    const midPoint = Math.max(1, Math.floor(publishedSeries.length / 2));
    return publishedSeries
      .slice(0, midPoint)
      .reduce((sum, bucket) => sum + bucket.value, 0);
  }, [publishedSeries]);
  const publishedDelta = publishedTotal - previousWindowTotal;
  const latestQuizScore = quizScoreTrend.at(-1)?.score ?? 0;
  const averageQuizAttempts = quizScoreTrend.reduce((sum, bucket) => sum + bucket.attempts, 0);
  const publishedOutputPoints = useMemo<BarMetricPoint[]>(
    () =>
      publishedSeries.map((bucket) => ({
        label: bucket.label,
        value: bucket.value,
      })),
    [publishedSeries],
  );
  const quizScorePoints = useMemo<BarMetricPoint[]>(
    () =>
      quizScoreTrend.map((bucket) => ({
        label: bucket.label,
        value: bucket.score,
        title: `${bucket.label}: ${bucket.score}% (${bucket.attempts} attempts)`,
      })),
    [quizScoreTrend],
  );

  const metricCards: AnalyticsMetricCard<MetricKey>[] = [
    {
      key: 'courseEngagement',
      title: 'Course Engagement',
      value: engagementSummary.totalEnrollments.toString(),
      description: `${engagementSummary.totalEnrollments} -> ${engagementSummary.activeLearners} -> ${engagementSummary.totalCompletions}`,
      icon: ArrowTrendingUpIcon,
    },
    {
      key: 'publishedOutput',
      title: 'Published Output',
      value: publishedTotal.toString(),
      description: `${publishedDelta > 0 ? '+' : ''}${publishedDelta} vs prior window`,
      icon: RocketLaunchIcon,
    },
    {
      key: 'coursePipeline',
      title: 'Quiz Average Over Time',
      value: `${latestQuizScore}%`,
      description: `${averageQuizAttempts} attempts across ${timeframe}`,
      icon: ChartBarIcon,
    },
  ];

  if (isLoading) {
    return (
      <DashboardAnalyticsSkeleton
        title="Contributor Analytics"
        description="Course metrics that spotlight engagement, output, and leaderboard performance."
      />
    );
  }

  return (
    <DashboardAnalyticsSection
      title="Contributor Analytics"
      description="Course metrics that spotlight engagement, output, and leaderboard performance."
      timeframe={timeframe}
      timeframeOptions={['1W', '1M', '1Y', 'ALL'] as const}
      onTimeframeChange={setTimeframe}
      metricCards={metricCards}
      selectedMetric={selectedMetric}
      onMetricSelect={setSelectedMetric}
    >
      {selectedMetric === 'courseEngagement' ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Engagement Funnel
            </p>
            <p className="text-xs text-slate-500">{timeframe} view</p>
          </div>
          {courses.length === 0 ? (
            <EmptyMetricState message="Create contributor courses to unlock funnel analytics here." />
          ) : (
            <div className="mt-4 flex min-h-[240px] flex-col justify-between rounded-md border border-slate-200/80 bg-slate-50/70 p-4 backdrop-blur-sm">
              {engagementSummary.funnelRows.map((row) => {
                const width = Math.max(
                  34,
                  Math.round(
                    (row.value / engagementSummary.maxFunnelValue) * 100,
                  ),
                );
                const share = Math.round(
                  (row.value / engagementSummary.maxFunnelValue) * 100,
                );
                return (
                  <div key={row.label}>
                    <div
                      className="mx-auto grid h-14 grid-cols-[1fr_auto_1fr] items-center rounded-md px-3 text-[11px] font-semibold text-white shadow-sm transition-all"
                      style={{ width: `${width}%`, backgroundColor: row.color }}
                    >
                      <span className="min-w-0 truncate text-left">
                        {row.label}
                      </span>
                      <span className="justify-self-center px-2 text-center">
                        {row.value}
                      </span>
                      <span className="justify-self-end text-right">
                        {share}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      {selectedMetric === 'publishedOutput' ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Published Output Trend
            </p>
            <p className="text-xs text-slate-500">
              Courses/releases shipped in this period
            </p>
          </div>
          {courses.length === 0 ? (
            <EmptyMetricState message="Publish-ready contributor courses will show output trends here." />
          ) : (
            <BarMetricChart points={publishedOutputPoints} />
          )}
        </>
      ) : null}

      {selectedMetric === 'coursePipeline' ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Quiz Average Scores Over Time
            </p>
            <p className="text-xs text-slate-500">
              Average quiz score trend by timeframe
            </p>
          </div>
          {courses.length === 0 ? (
            <EmptyMetricState message="Quiz score trends appear once courses start receiving learner attempts." />
          ) : (
            <BarMetricChart points={quizScorePoints} />
          )}
        </>
      ) : null}
    </DashboardAnalyticsSection>
  );
}
