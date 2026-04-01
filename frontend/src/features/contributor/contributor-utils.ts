import { formatChartDay, formatChartMonthYear } from '@/lib/chart-date';

export type Timeframe = '1W' | '1M' | '3M' | '1Y';
export type MetricKey =
  | 'courseEngagement'
  | 'publishedOutput'
  | 'coursePipeline';

export type RankedCourse = {
  courseId: string;
  title: string;
  enrollments: number;
  completions: number;
};

export type ReleaseBucket = {
  label: string;
  value: number;
};

export type QuizScoreBucket = {
  label: string;
  score: number;
  attempts: number;
};

export type BarMetricPoint = {
  label: string;
  value: number;
  title?: string;
};

export type FunnelRow = {
  label: string;
  value: number;
  color: string;
};

export type EngagementSummary = {
  totalEnrollments: number;
  activeLearners: number;
  totalCompletions: number;
  funnelRows: FunnelRow[];
  maxFunnelValue: number;
};

export function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function timeframeFactor(timeframe: Timeframe) {
  if (timeframe === '1W') return 0.32;
  if (timeframe === '1M') return 0.7;
  if (timeframe === '3M') return 0.82;
  if (timeframe === '1Y') return 0.9;
  return 1;
}

export function releaseBucketCount(timeframe: Timeframe) {
  if (timeframe === '1W') return 7;
  if (timeframe === '1M') return 5;
  if (timeframe === '3M') return 12;
  if (timeframe === '1Y') return 12;
  return 7;
}

export function releaseBucketLabel(
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
  if (timeframe === '3M') {
    const weeksAgo = count - 1 - index;
    const end = new Date(now.getTime() - weeksAgo * 7 * dayMs);
    return formatChartDay(end);
  }
  if (timeframe === '1Y') {
    const monthsAgo = count - 1 - index;
    const date = new Date(now.getTime() - monthsAgo * 30 * dayMs);
    return formatChartMonthYear(date);
  }
  return formatChartMonthYear(now);
}
