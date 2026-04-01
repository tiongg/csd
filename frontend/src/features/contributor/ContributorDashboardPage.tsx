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
import ContributorAnalytics from '@/features/contributor/ContributorAnalytics';
import { useResizableSplit } from '@/features/dashboard/useResizableSplit';
import { fetchClient, useApiQuery } from '@/lib/fetch-client';
import { useQueries } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { TopTrendsTable } from '../learner/dashboard/TopTrendsTable';

export default function ContributorDashboardPage() {
  const { user } = useAuth();
  const { splitContainerRef, splitStyle, startResizing } = useResizableSplit();
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
    return Array.from(
      new Map(allCourses.map((course) => [course.id, course])).values(),
    );
  }, [teamCourseQueries]);

  const courseIds = useMemo(
    () => teamCourses.map((course) => course.id),
    [teamCourses],
  );

  const contentVersionQueries = useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: ['contributorDashboardContentVersions', courseId],
      queryFn: async () => {
        const { data } = await fetchClient.GET(
          '/api/content-versions/{courseId}',
          {
            params: { path: { courseId } },
          },
        );
        return data ?? [];
      },
      enabled: courseIds.length > 0,
    })),
  });

  const courseStatusMap = useMemo(() => {
    const map = new Map<string, 'APPROVED' | 'PENDING' | 'REJECTED'>();
    teamCourses.forEach((course, index) => {
      const versions = contentVersionQueries[index]?.data ?? [];
      const latest = [...versions].sort(
        (a, b) => b.versionNumber - a.versionNumber,
      )[0];
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
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5),
    [courseStatusMap, teamCourses],
  );

  const filteredCourses = teamCourses.filter((course) =>
    course.title.toLowerCase().includes(trendSearch.toLowerCase()),
  );

  return (
    <div className="w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-8">
          <div className="grid gap-5">
            <div>
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
                Contributor Dashboard
              </div>
              <Heading1 className="mt-3 text-slate-900">
                Welcome back, {user?.username}.
              </Heading1>
              <p className="mt-2 max-w-4xl text-base leading-relaxed text-slate-600">
                Manage review pipelines, prioritize pending courses, and convert
                trend signals into publish-ready modules.
              </p>
            </div>
          </div>
        </section>

        <ContributorAnalytics />

        <div
          ref={splitContainerRef}
          className="flex flex-col gap-5 lg:flex-row lg:gap-0"
          style={splitStyle}
        >
          <section className="relative flex min-w-0 basis-full flex-col overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6 lg:[flex-basis:var(--left-pane)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Review Queue
              </h2>
              <p className="text-sm text-slate-500">{pendingCount} pending</p>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Courses awaiting contributor action.
            </p>

            {pendingCourses.length > 0 ? (
              <ul className="mt-4 max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {pendingCourses.map((course) => (
                  <li key={course.id}>
                    <Link
                      to="/contributor/editor/$courseId"
                      params={{ courseId: course.id }}
                      search={{ section: undefined }}
                      className="flex items-center justify-between rounded-lg border border-slate-300/85 bg-slate-100/70 px-3 py-2.5 transition-colors hover:border-sky-200 hover:bg-sky-50/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {course.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Updated {dayjs(course.updatedAt).fromNow()}
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full border border-slate-300/85 bg-white/58 px-2 py-0.5 text-xs font-medium text-slate-600 backdrop-blur-xl">
                        Pending
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-6">
                <div className="max-w-sm text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    Queue is clear
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    No pending reviews right now. New submissions from your
                    teams will appear here.
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
              onMouseDown={startResizing}
            />
          </div>

          <TopTrendsTable
            onTrendClick={(trend) => {
              setTrendSearch(trend);
              setIsTrendModalOpen(true);
            }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Today&apos;s Top Trends
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Top 5 signals to monitor.
            </p>
          </TopTrendsTable>
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
                      className="block rounded-lg border border-slate-300 bg-white/60 p-3 backdrop-blur-xl hover:border-slate-300"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {course.title}
                      </p>
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
