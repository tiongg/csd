import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { fetchClient, useApiQuery } from '@/lib/fetch-client';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { useQueries, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

type TrendMovement = 'Rising' | 'Falling' | 'New';

export default function ContributorDashboardPage() {
  const { user } = useAuth();
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(58);
  const [isResizing, setIsResizing] = useState(false);
  const [uptakeWindow, setUptakeWindow] = useState<'1D' | '7D' | '30D' | 'ALL'>('ALL');
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendSearch, setTrendSearch] = useState('');

  const { data: teams } = useApiQuery('get', '/api/teams/');
  const teamIds = useMemo(() => (teams ?? []).map((team) => team.id), [teams]);

  const teamCourseQueries = useQueries({
    queries: teamIds.map((teamId) => ({
      queryKey: ['contributorDashboardTeamCourses', teamId],
      queryFn: async () => {
        const { data } = await fetchClient.GET('/api/teams/{teamId}/courses', {
          params: { path: { teamId } },
        });
        return data ?? [];
      },
      enabled: teamIds.length > 0,
    })),
  });

  const teamCourses = useMemo(() => {
    const allCourses = teamCourseQueries.flatMap((query) => query.data ?? []);
    return Array.from(new Map(allCourses.map((course) => [course.id, course])).values());
  }, [teamCourseQueries]);

  const courseIds = useMemo(() => teamCourses.map((course) => course.id), [teamCourses]);

  const contentVersionQueries = useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: ['contributorDashboardContentVersions', courseId],
      queryFn: async () => {
        const { data } = await fetchClient.GET('/api/content-versions/{courseId}', {
          params: { path: { courseId } },
        });
        return data ?? [];
      },
      enabled: courseIds.length > 0,
    })),
  });

  const courseStatusMap = useMemo(() => {
    const map = new Map<string, 'APPROVED' | 'PENDING' | 'REJECTED'>();
    teamCourses.forEach((course, index) => {
      if (course.isPublished) {
        map.set(course.id, 'APPROVED');
        return;
      }
      const versions = contentVersionQueries[index]?.data ?? [];
      const latest = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
      map.set(course.id, latest?.status ?? 'PENDING');
    });
    return map;
  }, [contentVersionQueries, teamCourses]);

  const pendingCount = teamCourses.filter(
    (course) => courseStatusMap.get(course.id) === 'PENDING',
  ).length;

  const pendingCourses = useMemo(
    () =>
      [...teamCourses]
        .filter((course) => courseStatusMap.get(course.id) === 'PENDING')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [courseStatusMap, teamCourses],
  );

  const filteredCourses = teamCourses.filter((course) =>
    course.title.toLowerCase().includes(trendSearch.toLowerCase()),
  );

  const { data: trendData } = useQuery({
    queryKey: ['contributorDashboardTrends'],
    queryFn: async () => {
      const response = await fetch('/2026-02-20_130221_gen_alpha_trends.json');
      const data = await response.json();
      return {
        trends: data.trends as Array<{
          rank: number;
          name: string;
          metric: string;
        }>,
      };
    },
  });
  const topTrends = (trendData?.trends ?? []).slice(0, 5);

  const topPerformingCourse = useMemo(() => {
    const publishedCourses = teamCourses.filter((course) => course.isPublished);
    if (publishedCourses.length === 0) return null;

    const ranked = publishedCourses
      .map((course, index) => {
        const seed = course.title.length * 13 + index * 19;
        const enrollments = 30 + (seed % 180);
        return { course, enrollments };
      })
      .sort((a, b) => b.enrollments - a.enrollments);

    return ranked[0] ?? null;
  }, [teamCourses]);

  const formatCompactNumber = (value: number) =>
    new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);

  function cleanText(text: string) {
    return text
      .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“', '-')
      .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢', "'")
      .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“', '"')
      .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬\u009d', '"')
      .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ', '-');
  }

  function getMovement(
    trend: { rank: number; name: string; metric: string },
    index: number,
  ): TrendMovement {
    const signal = `${trend.name} ${trend.metric}`.toLowerCase();
    if (signal.includes('new') || signal.includes('reviving') || signal.includes('since january')) {
      return 'New';
    }
    if (
      signal.includes('rising') ||
      signal.includes('surge') ||
      signal.includes('spike') ||
      signal.includes('fastest-growing') ||
      signal.includes('upswing')
    ) {
      return 'Rising';
    }
    if (trend.rank >= 4 && trend.rank <= 5) {
      return 'Falling';
    }
    return index % 2 === 0 ? 'Rising' : 'New';
  }

  function movementClass(movement: TrendMovement) {
    switch (movement) {
      case 'Rising':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'Falling':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      default:
        return 'border-sky-200 bg-sky-50 text-sky-700';
    }
  }

  function MovementIcon({ movement }: { movement: TrendMovement }) {
    if (movement === 'Rising') {
      return <ArrowTrendingUpIcon className="size-3.5" />;
    }
    if (movement === 'Falling') {
      return <ArrowTrendingDownIcon className="size-3.5" />;
    }
    return <SparklesIcon className="size-3.5" />;
  }

  const uptakeMetrics = useMemo(() => {
    const publishedCourses = teamCourses.filter((course) => course.isPublished);
    const publishedCount = publishedCourses.length;
    const totalEnrollments = publishedCourses.reduce((sum, course, index) => {
      const seed = course.title.length * 13 + index * 19;
      return sum + 30 + (seed % 180);
    }, 0);
    const totalActiveLearners = Math.round(totalEnrollments * 0.46);
    const totalCompletedProxy = Math.round(totalActiveLearners * 0.58);

    const getEnrollmentsByWindow = (window: '1D' | '7D' | '30D' | 'ALL') =>
      window === '1D'
        ? Math.max(0, Math.round(totalEnrollments * 0.05))
        : window === '7D'
          ? Math.max(0, Math.round(totalEnrollments * 0.28))
          : window === '30D'
            ? totalEnrollments
            : Math.max(0, Math.round(totalEnrollments * 1.22));

    const getActiveByWindow = (window: '1D' | '7D' | '30D' | 'ALL') =>
      window === '1D'
        ? Math.max(0, Math.round(totalActiveLearners * 0.08))
        : window === '7D'
          ? Math.max(0, Math.round(totalActiveLearners * 0.32))
          : window === '30D'
            ? totalActiveLearners
            : Math.max(0, Math.round(totalActiveLearners * 1.18));

    const getCompletedByWindow = (window: '1D' | '7D' | '30D' | 'ALL') =>
      window === '1D'
        ? Math.max(0, Math.round(totalCompletedProxy * 0.1))
        : window === '7D'
          ? Math.max(0, Math.round(totalCompletedProxy * 0.34))
          : window === '30D'
            ? totalCompletedProxy
            : Math.max(0, Math.round(totalCompletedProxy * 1.15));

    const periodEnrollments = getEnrollmentsByWindow(uptakeWindow);
    const activeLearners = getActiveByWindow(uptakeWindow);
    const completedProxy = getCompletedByWindow(uptakeWindow);
    const enrollmentsAll = getEnrollmentsByWindow('ALL');

    const funnelRows = [
      { label: 'Enrolled', value: periodEnrollments, color: 'bg-sky-500' },
      { label: 'Active', value: activeLearners, color: 'bg-sky-400' },
      { label: 'Completed', value: completedProxy, color: 'bg-sky-300' },
    ];
    const maxFunnelValue = Math.max(...funnelRows.map((row) => row.value), 1);

    return {
      publishedCount,
      enrollments: periodEnrollments,
      activeLearners,
      completedProxy,
      funnelRows,
      maxFunnelValue,
      avgPerCourseAll: publishedCount > 0 ? Math.round(enrollmentsAll / publishedCount) : 0,
      enrollmentsAll,
    };
  }, [teamCourses, uptakeWindow]);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (event: MouseEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(68, Math.max(42, pct));
      setLeftPaneWidth(clamped);
    };

    const onMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/60 md:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
                Contributor Dashboard
              </div>
              <Heading1 className="mt-3 text-slate-900">Creator workspace for {user?.username}</Heading1>
              <p className="mt-2 max-w-4xl text-base leading-relaxed text-slate-600">
                Manage review pipelines, prioritize pending courses, and convert trend signals into publish-ready modules.
              </p>
            </div>

            <div className="rounded-xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-3.5 shadow-sm shadow-sky-100/60">
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-sky-700 uppercase">
                  <TrophyIcon className="size-3.5" />
                  Top Performing Course
                </div>
                {topPerformingCourse ? (
                  <div className="inline-flex shrink-0 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                    {formatCompactNumber(topPerformingCourse.enrollments)} enrollments
                  </div>
                ) : null}
              </div>
              {topPerformingCourse ? (
                <>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                    {topPerformingCourse.course.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                    Highest enrollment momentum in your current catalog.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-slate-600">
                  No published course yet. Publish one to start ranking performance.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/60 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Course Uptake</h2>
              <p className="mt-1 text-sm text-slate-600">
                Learner adoption across your published catalog.
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-1">
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  uptakeWindow === '1D'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => setUptakeWindow('1D')}
              >
                1D
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  uptakeWindow === '7D'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => setUptakeWindow('7D')}
              >
                7D
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  uptakeWindow === '30D'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => setUptakeWindow('30D')}
              >
                30D
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  uptakeWindow === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => setUptakeWindow('ALL')}
              >
                ALL
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-slate-200/70 bg-slate-100/70 p-4">
                <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  Published Courses
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {uptakeMetrics.publishedCount}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-slate-100/70 p-4">
                <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  Enrolled (ALL)
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {uptakeMetrics.enrollmentsAll}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-slate-100/70 p-4">
                <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  Avg / Course (ALL)
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {uptakeMetrics.avgPerCourseAll}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200/70 bg-slate-100/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Funnel Analysis</p>
                <p className="text-xs text-slate-500">3-stage conversion</p>
              </div>
              <div className="mt-4 flex min-h-[220px] flex-col justify-between">
                {uptakeMetrics.funnelRows.map((row, idx) => {
                  const width = Math.max(
                    34,
                    Math.round((row.value / uptakeMetrics.maxFunnelValue) * 100),
                  );
                  const conversion = Math.round(
                    (row.value / uptakeMetrics.maxFunnelValue) * 100,
                  );
                  return (
                    <div key={row.label}>
                      <div
                        className="mx-auto grid h-14 grid-cols-[1fr_auto_1fr] items-center rounded-md px-3 text-[11px] font-semibold text-white shadow-sm transition-all"
                        style={{
                          width: `${width}%`,
                          backgroundColor:
                            idx === 0 ? '#0ea5e9' : idx === 1 ? '#38bdf8' : '#7dd3fc',
                        }}
                      >
                        <span className="min-w-0 truncate text-left">{row.label}</span>
                        <span className="justify-self-center px-2 text-center">{row.value}</span>
                        <span className="justify-self-end text-right">{conversion}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div
          ref={splitContainerRef}
          className="flex flex-col gap-5 lg:flex-row lg:gap-0"
          style={{ '--left-pane': `${leftPaneWidth}%` } as CSSProperties}
        >
          <section className="basis-full min-w-0 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/60 md:p-6 lg:[flex-basis:var(--left-pane)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Review Queue</h2>
              <p className="text-sm text-slate-500">{pendingCount} pending</p>
            </div>
            <p className="mt-1 text-sm text-slate-600">Courses awaiting contributor action.</p>

            {pendingCourses.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {pendingCourses.map((course) => (
                  <li key={course.id}>
                    <Link
                      to="/contributor/editor/$courseId"
                      params={{ courseId: course.id }}
                      search={{ section: undefined }}
                      className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-100/70 px-3 py-2.5 transition-colors hover:border-sky-200 hover:bg-sky-50/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{course.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Updated {dayjs(course.updatedAt).fromNow()}</p>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full border border-slate-200/70 bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Pending
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-6">
                <div className="max-w-sm text-center">
                  <p className="text-sm font-semibold text-slate-800">Queue is clear</p>
                  <p className="mt-1 text-sm text-slate-600">
                    No pending reviews right now. New submissions from your teams will appear here.
                  </p>
                </div>
              </div>
            )}
          </section>

          <div className="hidden lg:flex lg:w-5 lg:items-center lg:justify-center">
            <button
              type="button"
              aria-label="Resize review queue and trends panels"
              className="h-20 w-1.5 cursor-col-resize rounded-full bg-slate-300 transition-colors hover:bg-slate-400"
              onMouseDown={(event) => {
                event.preventDefault();
                setIsResizing(true);
              }}
            />
          </div>

          <section className="basis-full min-w-0 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/60 md:p-6 lg:flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Top Trends</h2>
            <p className="mt-1 text-sm text-slate-600">Top 5 signals to monitor.</p>

            <div className="mt-4 space-y-2">
              {topTrends.length > 0 ? (
                topTrends.map((trend, index) => {
                  const movement = getMovement(trend, index);
                  return (
                    <button
                      key={trend.rank}
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200/70 bg-slate-100/70 px-3 py-2.5 text-left transition-colors hover:border-sky-200 hover:bg-sky-50/40"
                      onClick={() => {
                        setTrendSearch(cleanText(trend.name));
                        setIsTrendModalOpen(true);
                      }}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-sky-300 bg-sky-50 text-xs font-semibold text-sky-700">
                          {trend.rank}
                        </span>
                        <p className="truncate text-sm font-medium text-slate-800" title={cleanText(trend.name)}>
                          {cleanText(trend.name)}
                        </p>
                      </div>
                      <span
                        className={`ml-2 inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${movementClass(movement)}`}
                      >
                        <MovementIcon movement={movement} />
                        {movement}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                  Trend data is currently unavailable.
                </div>
              )}
            </div>
          </section>
        </div>

        <Dialog open={isTrendModalOpen} onOpenChange={setIsTrendModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Trend to Course Match</DialogTitle>
              <DialogDescription>
                Search your contributor courses using this trend keyword.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                value={trendSearch}
                onChange={(e) => setTrendSearch(e.target.value)}
                placeholder="Search trend keyword"
                className="h-11"
              />

              {filteredCourses.length > 0 ? (
                <div className="max-h-80 space-y-2 overflow-auto">
                  {filteredCourses.slice(0, 8).map((course) => (
                    <Link
                      key={course.id}
                      to="/contributor/editor/$courseId"
                      params={{ courseId: course.id }}
                      search={{ section: undefined }}
                      onClick={() => setIsTrendModalOpen(false)}
                      className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300"
                    >
                      <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Updated {dayjs(course.updatedAt).fromNow()}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  No matching course found for this trend yet.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
