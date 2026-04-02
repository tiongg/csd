import { fetchClient, useApiQuery } from '@/lib/fetch-client';
import { useQueries } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useMemo } from 'react';

export function ContributorReviewQueue() {
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
    teamCourses.forEach((course) => {
      const courseIndex = teamCourses.findIndex((c) => c.id === course.id);
      const versions = contentVersionQueries[courseIndex]?.data ?? [];
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

  return (
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
  );
}
