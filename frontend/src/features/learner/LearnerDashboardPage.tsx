import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import useEnrolledCourse from '@/context/EnrolledCourseContext';
import { useResizableSplit } from '@/features/dashboard/useResizableSplit';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import {
  useMemo,
  useState,
} from 'react';
import PersonalAnalytics from './dashboard/PersonalAnalytics';
import { TopTrendsTable } from './dashboard/TopTrendsTable';
import { TrendCourseSearchDialog } from './dashboard/TrendCourseSearchDialog';

export default function LearnerDashboardPage() {
  const { user } = useAuth();
  const { enrolledCourses } = useEnrolledCourse();
  const { splitContainerRef, splitStyle, startResizing } = useResizableSplit();
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendSearch, setTrendSearch] = useState('');

  const inProgressCourses = useMemo(
    () =>
      (enrolledCourses ?? [])
        .filter((enrollment) => enrollment.status === 'ENROLLED')
        .sort(
          (a, b) =>
            new Date(b.course.updatedAt).getTime() -
            new Date(a.course.updatedAt).getTime(),
        )
        .slice(0, 5),
    [enrolledCourses],
  );

  return (
    <div className="w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-8">
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
            Learner Dashboard
          </div>
          <Heading1 className="mt-3 text-slate-900">
            Welcome back, {user?.username}.
          </Heading1>
          <p className="mt-2 max-w-4xl text-base leading-relaxed text-slate-600">
            Monitor key trend shifts and focus on what is most relevant today.
          </p>
        </section>

        <PersonalAnalytics />

        <div
          ref={splitContainerRef}
          className="flex flex-col gap-5 lg:flex-row lg:gap-0"
          style={splitStyle}
        >
          <section className="relative flex min-w-0 basis-full flex-col overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6 lg:[flex-basis:var(--left-pane)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Courses In Progress
              </h2>
              <p className="text-sm text-slate-500">
                {inProgressCourses.length} active
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Continue where you left off.
            </p>

            {inProgressCourses.length > 0 ? (
              <ul className="mt-4 grid flex-1 auto-rows-fr gap-2">
                {inProgressCourses.map((enrollment) => (
                  <li key={enrollment.lessonSessionId}>
                    <Link
                      to="/learner/courses/$courseId"
                      params={{ courseId: enrollment.course.id }}
                      className="flex h-full items-center justify-between rounded-lg border border-slate-300/85 bg-slate-100/70 px-3 py-2.5 transition-colors hover:border-sky-200 hover:bg-sky-50/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {enrollment.course.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Updated {dayjs(enrollment.course.updatedAt).fromNow()}
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full border border-slate-300/85 bg-white/58 px-2 py-0.5 text-xs font-medium text-slate-600 backdrop-blur-xl">
                        In Progress
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex min-h-[260px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-6">
                <div className="max-w-sm text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    No active course
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Start a course to build momentum and track progress here.
                  </p>
                </div>
              </div>
            )}
          </section>

          <div className="hidden lg:flex lg:w-5 lg:items-center lg:justify-center">
            <button
              type="button"
              aria-label="Resize dashboard panels"
              className="h-20 w-1.5 cursor-col-resize rounded-full bg-slate-300 transition-colors hover:bg-slate-400"
              onMouseDown={startResizing}
            />
          </div>

          <TopTrendsTable
            onTrendClick={(trendName) => {
              setTrendSearch(trendName);
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

        <TrendCourseSearchDialog
          initialSearchValue={trendSearch}
          open={isTrendModalOpen}
          onOpenChange={setIsTrendModalOpen}
        />
      </div>
    </div>
  );
}
