import type { Course } from '@/lib/utils';
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import {
  DashboardAnalyticsSection,
  DashboardAnalyticsSkeleton,
  type AnalyticsMetricCard,
} from '../dashboard/AnalyticsSection';
import {
  CourseEngagementMetric,
  CoursePipelineMetric,
  PublishedOutputMetric,
} from './analytics';
import {
  buildCourseCountBuckets,
  buildEngagementSummary,
  buildQuizScoreTrend,
  rankCourses,
} from './contributor-data-processors';
import type { BarMetricPoint, MetricKey, Timeframe } from './contributor-utils';

type ContributorAnalyticsProps = {
  courses: Course[];
  isLoading: boolean;
};

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

  const engagementSummary = useMemo(
    () => buildEngagementSummary(rankedCourses),
    [rankedCourses],
  );

  const publishedSeries = useMemo(
    () =>
      buildCourseCountBuckets(courses, timeframe, (course) => course.updatedAt),
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
  const averageQuizAttempts = quizScoreTrend.reduce(
    (sum, bucket) => sum + bucket.attempts,
    0,
  );
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
      timeframeOptions={['1W', '1M', '3M', '1Y'] as const}
      onTimeframeChange={setTimeframe}
      metricCards={metricCards}
      selectedMetric={selectedMetric}
      onMetricSelect={setSelectedMetric}
    >
      {selectedMetric === 'courseEngagement' ? (
        <CourseEngagementMetric
          courses={courses}
          engagementSummary={engagementSummary}
          timeframe={timeframe}
        />
      ) : null}

      {selectedMetric === 'publishedOutput' ? (
        <PublishedOutputMetric
          courses={courses}
          publishedOutputPoints={publishedOutputPoints}
        />
      ) : null}

      {selectedMetric === 'coursePipeline' ? (
        <CoursePipelineMetric
          courses={courses}
          quizScorePoints={quizScorePoints}
        />
      ) : null}
    </DashboardAnalyticsSection>
  );
}
