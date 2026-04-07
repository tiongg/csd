import { useApiQuery } from '@/lib/fetch-client';
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { match } from 'ts-pattern';
import {
  DashboardAnalyticsSection,
  DashboardAnalyticsSkeleton,
  type AnalyticsMetricCard,
} from '../dashboard/AnalyticsSection';
import CourseEngagementMetric from './analytics/CourseEngagementMetric';
import EnrollmentTrendMetric from './analytics/EnrollmentTrendMetric';
import PublishedOutputMetric from './analytics/PublishedOutputMetric';
import type {
  BarMetricPoint,
  EngagementSummary,
  FunnelRow,
  MetricKey,
  Timeframe,
} from './contributor-utils';

export default function ContributorAnalytics() {
  const [timeframe, setTimeframe] = useState<Timeframe>('1W');
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>('courseEngagement');

  const { data: analytics, isLoading } = useApiQuery(
    'get',
    '/api/contributor/analytics',
    {
      params: {
        query: { timeframe },
      },
    },
    {
      // Keep current data mounted while a new timeframe fetch is in flight.
      placeholderData: (previousData) => previousData,
    },
  );

  if (!analytics && isLoading) {
    return (
      <DashboardAnalyticsSkeleton
        title="Contributor Analytics"
        description="Course metrics that spotlight engagement, output, and enrollment trends."
      />
    );
  }

  if (!analytics) {
    return null;
  }

  const funnelRows: FunnelRow[] = [
    {
      label: 'Enrolled',
      value: analytics.engagementSummary.enrolled,
      color: '#0ea5e9',
    },
    {
      label: 'Active',
      value: analytics.engagementSummary.active,
      color: '#38bdf8',
    },
    {
      label: 'Completed',
      value: analytics.engagementSummary.completed,
      color: '#7dd3fc',
    },
  ];

  const maxFunnelValue = Math.max(1, ...funnelRows.map((row) => row.value));

  const engagementSummary: EngagementSummary = {
    totalEnrollments: analytics.engagementSummary.enrolled,
    activeLearners: analytics.engagementSummary.active,
    totalCompletions: analytics.engagementSummary.completed,
    funnelRows,
    maxFunnelValue,
  };

  const enrollmentTrendPoints: BarMetricPoint[] = analytics.enrollmentTrend.map(
    (bucket) => ({
      label: bucket.label,
      value: bucket.value,
      title: `${bucket.label}: ${bucket.value} enrollments`,
    }),
  );

  const publishedOutputPoints: BarMetricPoint[] = analytics.publishedSeries.map(
    (bucket) => ({
      label: bucket.label,
      value: bucket.value,
    }),
  );

  const metricCards: AnalyticsMetricCard<MetricKey>[] = [
    {
      key: 'courseEngagement',
      title: 'Course Engagement',
      value: engagementSummary.totalCompletions.toString(),
      description: 'Course completions',
      icon: ArrowTrendingUpIcon,
    },
    {
      key: 'publishedOutput',
      title: 'Published Output',
      value: analytics.publishedTotal.toString(),
      description: 'Course updates',
      icon: RocketLaunchIcon,
    },
    {
      key: 'coursePipeline',
      title: 'Enrollment Trend',
      value: analytics.totalEnrollmentCount.toString(),
      description: 'New users enrolled',
      icon: ChartBarIcon,
    },
  ];

  return (
    <DashboardAnalyticsSection
      title="Contributor Analytics"
      description="Course metrics that spotlight engagement, output, and enrollment trends."
      timeframe={timeframe}
      timeframeOptions={['1W', '1M', '3M', '1Y'] as const}
      onTimeframeChange={setTimeframe}
      metricCards={metricCards}
      selectedMetric={selectedMetric}
      onMetricSelect={setSelectedMetric}
    >
      {match(selectedMetric)
        .with('courseEngagement', () => (
          <CourseEngagementMetric
            engagementSummary={engagementSummary}
            timeframe={timeframe}
          />
        ))
        .with('publishedOutput', () => (
          <PublishedOutputMetric
            publishedOutputPoints={publishedOutputPoints}
          />
        ))
        .with('coursePipeline', () => (
          <EnrollmentTrendMetric
            enrollmentTrendPoints={enrollmentTrendPoints}
          />
        ))
        .otherwise(() => null)}
    </DashboardAnalyticsSection>
  );
}
