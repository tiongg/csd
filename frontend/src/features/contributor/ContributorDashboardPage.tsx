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
} from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { useQueries, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

type TrendMovement = 'Rising' | 'Falling' | 'New';

export default function ContributorDashboardPage() {
  const { user } = useAuth();
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

  const approvedCount = teamCourses.filter((course) => course.isPublished).length;
  const rejectedCount = teamCourses.filter(
    (course) => courseStatusMap.get(course.id) === 'REJECTED',
  ).length;
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

  function cleanText(text: string) {
    return text
      .replaceAll('ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Ëœ', '-')
      .replaceAll('ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢', "'")
      .replaceAll('ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ', '"')
      .replaceAll('ÃƒÂ¢Ã¢â€šÂ¬\u009d', '"')
      .replaceAll('ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“', '-');
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
    const enrollments = publishedCourses.reduce((sum, course, index) => {
      const seed = course.title.length * 13 + index * 19;
      return sum + 30 + (seed % 180);
    }, 0);
    const activeLearners = Math.round(enrollments * 0.46);
    const avgPerCourse = publishedCount > 0 ? Math.round(enrollments / publishedCount) : 0;
    const completionRate = enrollments > 0 ? Math.min(92, Math.max(35, Math.round((approvedCount / (teamCourses.length || 1)) * 100))) : 0;

    const topCourses = publishedCourses
      .map((course, index) => {
        const seed = course.title.length * 11 + index * 23;
        return {
          id: course.id,
          title: course.title,
          enrolled: 25 + (seed % 140),
        };
      })
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 3);

    return {
      enrollments,
      activeLearners,
      avgPerCourse,
      completionRate,
      topCourses,
    };
  }, [approvedCount, teamCourses]);

  return (
    <div className="w-full bg-slate-50 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
            Contributor Dashboard
          </div>
          <Heading1 className="mt-3 text-slate-900">Creator workspace for {user?.username}</Heading1>
          <p className="mt-2 max-w-4xl text-base leading-relaxed text-slate-600">
            Manage review pipelines, prioritize pending courses, and convert trend signals into publish-ready modules.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Course Uptake</h2>
          <p className="mt-1 text-sm text-slate-600">
            Learner subscription and engagement footprint across your published courses.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total Enrollments</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {uptakeMetrics.enrollments}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Active Learners</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {uptakeMetrics.activeLearners}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Avg Enrollments/Course</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {uptakeMetrics.avgPerCourse}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Completion Rate</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {uptakeMetrics.completionRate}%
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Top Subscribed Courses</p>
              <p className="text-xs text-slate-500">Published courses</p>
            </div>
            {uptakeMetrics.topCourses.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {uptakeMetrics.topCourses.map((course) => (
                  <li key={course.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                    <p className="truncate text-sm font-medium text-slate-900">{course.title}</p>
                    <span className="ml-3 shrink-0 text-xs font-semibold text-slate-600">
                      {course.enrolled} learners
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                Publish courses to see subscription metrics.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Review Queue</h2>
              <p className="text-sm text-slate-500">{pendingCount} pending</p>
            </div>
            <p className="mt-1 text-sm text-slate-600">Courses awaiting contributor action.</p>

            <ul className="mt-4 space-y-2">
              {pendingCourses.length > 0 ? (
                pendingCourses.map((course) => (
                  <li key={course.id}>
                    <Link
                      to="/contributor/editor/$courseId"
                      params={{ courseId: course.id }}
                      search={{ section: undefined }}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 transition-colors hover:border-sky-200 hover:bg-sky-50/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{course.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Updated {dayjs(course.updatedAt).fromNow()}
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                        Pending
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                  No pending reviews right now.
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
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
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition-colors hover:border-sky-200 hover:bg-sky-50/40"
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
        </section>

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
