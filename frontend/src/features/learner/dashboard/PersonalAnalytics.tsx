import useEnrolledCourse from '@/context/EnrolledCourseContext';
import {
  DashboardAnalyticsSection,
  DashboardAnalyticsSkeleton,
  type AnalyticsMetricCard,
} from '@/features/dashboard/AnalyticsSection';
import { useApiQuery } from '@/lib/fetch-client';
import { formatChartDay } from '@/lib/chart-date';
import {
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

function buildStreakSeries(weeklyCadence: number[]) {
  let streak = 0;
  return weeklyCadence.map((day) => {
    if (day === 1) {
      streak += 1;
    } else {
      streak = 0;
    }
    return streak;
  });
}

function normalizeWeeklyCadence(rawCadence: number[] | undefined) {
  const source = Array.isArray(rawCadence) ? rawCadence : [];
  return Array.from({ length: 7 }, (_, idx) => (source[idx] ? 1 : 0));
}

function currentStreakFromCadence(cadence: number[]) {
  if (cadence.length === 0) return 0;

  let startIdx = cadence.length - 1;
  if (cadence[startIdx] === 0) {
    startIdx -= 1;
  }
  if (startIdx < 0 || cadence[startIdx] === 0) return 0;

  let streak = 0;
  for (let i = startIdx; i >= 0; i--) {
    if (cadence[i] === 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function windowDaysFor(timeframe: Timeframe) {
  if (timeframe === '1W') return 7;
  if (timeframe === '1M') return 30;
  if (timeframe === '3M') return 90;
  if (timeframe === '1Y') return 365;
  return 7;
}

function buildWindowCadence(cadence: number[], days: number) {
  const next = Array.from({ length: days }, () => 0);
  const tail = cadence.slice(-days);
  const start = days - tail.length;
  for (let i = 0; i < tail.length; i++) {
    next[start + i] = tail[i] ?? 0;
  }
  return next;
}

function chunkSizeFor(timeframe: Timeframe, totalDays: number) {
  if (timeframe === '1W') return 1;
  if (timeframe === '1M') return 5;
  if (timeframe === '3M') return 7;
  if (timeframe === '1Y') return 30;
  return Math.max(30, Math.ceil(totalDays / 12));
}

function compressSeries(series: number[], timeframe: Timeframe) {
  const maxPoints = timeframe === '1W'
    ? 7
    : timeframe === '1M'
      ? 15
      : timeframe === '3M'
        ? 13
        : timeframe === '1Y'
          ? 12
          : 24;
  if (series.length <= maxPoints) return series;

  const step = Math.ceil(series.length / maxPoints);
  const compressed: number[] = [];

  for (let i = 0; i < series.length; i += step) {
    const slice = series.slice(i, i + step);
    const avg = slice.reduce((sum, value) => sum + value, 0) / Math.max(1, slice.length);
    compressed.push(avg);
  }

  return compressed;
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0]?.x} ${points[0]?.y}`;

  let path = `M ${points[0]?.x} ${points[0]?.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!prev || !curr) continue;

    const cx1 = prev.x + (curr.x - prev.x) / 3;
    const cy1 = prev.y;
    const cx2 = curr.x - (curr.x - prev.x) / 3;
    const cy2 = curr.y;
    path += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
  }

  return path;
}

type Timeframe = '1W' | '1M' | '3M' | '1Y';
type MetricKey = 'focusScore' | 'completionRate' | 'currentStreak';

export default function PersonalAnalytics() {
  const { enrolledCourses } = useEnrolledCourse();
  const [timeframe, setTimeframe] = useState<Timeframe>('1W');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('focusScore');
  const { data: analytics, isLoading } = useApiQuery(
    'get',
    '/api/learner/analytics',
  );

  const inProgressCount = (enrolledCourses ?? []).filter(
    (enrollment) => enrollment.status === 'ENROLLED',
  ).length;
  const isPending = isLoading || !analytics;
  const weeklyCadence = normalizeWeeklyCadence(analytics?.weeklyCadence);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const windowDays = windowDaysFor(timeframe);
  const windowCadence = buildWindowCadence(weeklyCadence, windowDays);
  const activeDays = windowCadence.reduce((sum, day) => sum + day, 0);
  const completedCoursesCount = analytics?.completedCoursesCount ?? 0;
  const currentStreak = currentStreakFromCadence(windowCadence);
  const rawStreakSeries = buildStreakSeries(windowCadence);
  const streakSeries = useMemo(
    () => compressSeries(rawStreakSeries, timeframe),
    [rawStreakSeries, timeframe],
  );
  const longestStreak = Math.max(0, ...rawStreakSeries);
  const totalTrackedCourses = completedCoursesCount + inProgressCount;
  const completionRate = totalTrackedCourses > 0
    ? Math.round((completedCoursesCount / totalTrackedCourses) * 100)
    : 0;
  const hasTrackedCourses = totalTrackedCourses > 0;
  const completedRatio = totalTrackedCourses > 0 ? completedCoursesCount / totalTrackedCourses : 0;
  const inProgressRatio = totalTrackedCourses > 0 ? inProgressCount / totalTrackedCourses : 0;
  const donutRadius = 88;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const completedArc = completedRatio * donutCircumference;
  const inProgressArc = inProgressRatio * donutCircumference;

  const width = 760;
  const height = 190;
  const pad = 20;
  const maxStreak = Math.max(1, ...streakSeries);
  const points = streakSeries.map((value, idx) => {
    const x =
      pad + (idx * (width - pad * 2)) / Math.max(1, streakSeries.length - 1);
    const chartRange = (height - pad * 2) * 0.55;
    const y = height - pad - (value / maxStreak) * chartRange;
    return { x, y };
  });
  const smoothLinePath = buildSmoothPath(points);
  const areaPath = `${smoothLinePath} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`;

  const rangeStartDate = useMemo(() => {
    const start = new Date(now);
    start.setDate(now.getDate() - (windowDays - 1));
    return start;
  }, [now, windowDays]);

  const focusBars = useMemo(() => {
    const chunkSize = chunkSizeFor(timeframe, windowCadence.length);
    const bars: { label: string; value: number; max: number }[] = [];

    for (let idx = 0; idx < windowCadence.length; idx += chunkSize) {
      const end = Math.min(idx + chunkSize, windowCadence.length);
      const slice = windowCadence.slice(idx, end);
      const value = slice.reduce((sum, day) => sum + day, 0);
      const daysBackFromToday = windowCadence.length - end;
      const bucketDate = new Date(now);
      bucketDate.setDate(now.getDate() - daysBackFromToday);

      bars.push({
        label: formatChartDay(bucketDate, timezone),
        value,
        max: chunkSize,
      });
    }

    return bars.map((bar) => ({
      ...bar,
      height: 20 + Math.round((bar.value / Math.max(1, bar.max)) * 56),
      isActive: bar.value > 0,
    }));
  }, [now, timeframe, timezone, windowCadence]);

  const timeframeLabel = timeframe;
  const rangeLabel = `${formatChartDay(rangeStartDate, timezone)} - ${formatChartDay(now, timezone)} (${timezone})`;
  const momentumAxisLabels = useMemo(() => {
    const midDate = new Date(rangeStartDate);
    midDate.setDate(rangeStartDate.getDate() + Math.floor((windowDays - 1) / 2));
    return [
      { x: pad, label: formatChartDay(rangeStartDate, timezone), anchor: 'start' as const },
      { x: width / 2, label: formatChartDay(midDate, timezone), anchor: 'middle' as const },
      { x: width - pad, label: formatChartDay(now, timezone), anchor: 'end' as const },
    ];
  }, [now, pad, rangeStartDate, timezone, width, windowDays]);

  const metricCards: AnalyticsMetricCard<MetricKey>[] = [
    {
      key: 'focusScore' as const,
      title: 'Active Days',
      value: `${activeDays}/${windowDays}`,
      description: `Consistency in ${timeframeLabel.toUpperCase()}`,
      icon: ArrowTrendingUpIcon,
    },
    {
      key: 'completionRate' as const,
      title: 'Completion Rate',
      value: `${completionRate}%`,
      description: `${completedCoursesCount} of ${totalTrackedCourses} finished (as of ${formatChartDay(now, timezone)})`,
      icon: CheckBadgeIcon,
    },
    {
      key: 'currentStreak' as const,
      title: 'Current Streak',
      value: `${currentStreak} day${currentStreak === 1 ? '' : 's'}`,
      description: `Longest in ${timeframeLabel}: ${longestStreak} days`,
      icon: FireIcon,
    },
  ];

  if (isPending) {
    return (
      <DashboardAnalyticsSkeleton
        title="Personal Analytics"
        description="High-impact metrics that show consistency, output, and momentum."
      />
    );
  }

  return (
    <DashboardAnalyticsSection
      title="Personal Analytics"
      description="High-impact metrics that show consistency, output, and momentum."
      timeframe={timeframe}
      timeframeOptions={['1W', '1M', '3M', '1Y'] as const}
      onTimeframeChange={setTimeframe}
      metricCards={metricCards}
      selectedMetric={selectedMetric}
      onMetricSelect={setSelectedMetric}
    >
          {selectedMetric === 'focusScore' ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Activity Trend ({timeframeLabel})</p>
                <p className="text-xs text-slate-500">{rangeLabel}</p>
              </div>
              <div className="mt-4 flex h-[240px] items-end gap-2 rounded-md border border-slate-200/80 bg-slate-50/70 p-3 backdrop-blur-sm">
                {focusBars.map((bar) => (
                  <div key={bar.label} className="flex flex-1 flex-col items-center justify-end">
                    <div
                      className={`w-full rounded-t transition-all ${
                        bar.isActive ? 'bg-sky-500' : 'bg-slate-300'
                      }`}
                      style={{ height: `${bar.height}px` }}
                    />
                    <span className="mt-2 text-[10px] text-slate-500">{bar.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {selectedMetric === 'completionRate' ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Completion Breakdown</p>
                <p className="text-xs text-slate-500">Snapshot: {formatChartDay(now, timezone)} ({timezone})</p>
              </div>
              <div className="mt-4 flex h-[240px] items-center justify-center rounded-md border border-slate-200/80 bg-slate-50/70 p-6 backdrop-blur-sm">
                <div className="grid h-full w-full max-w-[860px] grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_280px] md:justify-items-center">
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="relative h-[210px] w-[210px]">
                      <svg viewBox="0 0 260 260" className="h-full w-full">
                      <circle
                        cx="130"
                        cy="130"
                        r={donutRadius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="28"
                      />
                      {hasTrackedCourses && completedArc > 0 ? (
                        <circle
                          cx="130"
                          cy="130"
                          r={donutRadius}
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="28"
                          strokeLinecap="round"
                          strokeDasharray={`${completedArc} ${donutCircumference}`}
                          transform="rotate(-90 130 130)"
                        />
                      ) : null}
                      {hasTrackedCourses && inProgressArc > 0 ? (
                        <circle
                          cx="130"
                          cy="130"
                          r={donutRadius}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="28"
                          strokeLinecap="round"
                          strokeDasharray={`${inProgressArc} ${donutCircumference}`}
                          strokeDashoffset={-completedArc}
                          transform="rotate(-90 130 130)"
                        />
                      ) : null}
                    </svg>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-4xl leading-none font-semibold text-slate-900">{completionRate}%</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">Completed</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-sky-500" />
                        <p className="text-sm text-slate-700">Completed</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{completedCoursesCount}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-slate-400" />
                        <p className="text-sm text-slate-700">In progress</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{inProgressCount}</p>
                    </div>
                    <div className="pt-1 text-xs text-slate-500">
                      Total tracked: {totalTrackedCourses}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {selectedMetric === 'currentStreak' ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Momentum Curve ({timeframeLabel})</p>
                <p className="text-xs text-slate-500">{rangeLabel}</p>
              </div>
              <div className="mt-4 h-[240px] overflow-hidden rounded-md border border-slate-200/80 bg-slate-50/70 p-2 backdrop-blur-sm">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="momentum-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((i) => {
                    const y = pad + (i * (height - pad * 2)) / 3;
                    return (
                      <line
                        key={i}
                        x1={pad}
                        x2={width - pad}
                        y1={y}
                        y2={y}
                        stroke="#dbeafe"
                        strokeDasharray="3 8"
                      />
                    );
                  })}
                  <line
                    x1={pad}
                    x2={width - pad}
                    y1={height - pad}
                    y2={height - pad}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                  <path d={areaPath} fill="url(#momentum-area)" />
                  <path d={smoothLinePath} fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                  {points.map((point) => (
                    <circle
                      key={`${point.x}-${point.y}`}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />
                  ))}
                  {momentumAxisLabels.map((tick) => (
                    <g key={tick.label}>
                      <line
                        x1={tick.x}
                        x2={tick.x}
                        y1={height - pad}
                        y2={height - pad + 6}
                        stroke="#94a3b8"
                        strokeWidth="1"
                      />
                      <text
                        x={tick.x}
                        y={height - pad + 18}
                        textAnchor={tick.anchor}
                        fontSize="11"
                        fill="#64748b"
                      >
                        {tick.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </>
          ) : null}
    </DashboardAnalyticsSection>
  );
}
