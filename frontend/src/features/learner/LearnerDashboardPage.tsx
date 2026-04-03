import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import useEnrolledCourse from '@/context/EnrolledCourseContext';
import { useResizableSplit } from '@/features/dashboard/useResizableSplit';
import { useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
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
  const displayName = user?.realname?.trim() || user?.username;
  const { enrolledCourses } = useEnrolledCourse();
  const { data: publishedCourses } = useApiQuery('get', '/api/courses/published');
  const { splitContainerRef, splitStyle, startResizing } = useResizableSplit();
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendSearch, setTrendSearch] = useState('');

  const publishedCourseMetaById = useMemo(() => {
    const map = new Map<
      string,
      { imageUrl?: string; tags?: string[]; creatorUsername?: string }
    >();
    (publishedCourses ?? []).forEach(({ course }) => {
      map.set(course.id, {
        imageUrl: course.imageUrl,
        tags: course.tags,
        creatorUsername: course.creatorUsername,
      });
    });
    return map;
  }, [publishedCourses]);

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
            Welcome back, {displayName}.
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
              <div className="mt-4 flex min-h-0 flex-1 flex-col">
                <ul className="flex min-h-0 flex-1 snap-x snap-mandatory gap-0 overflow-x-auto pb-2 scroll-smooth">
                {inProgressCourses.map((enrollment) => (
                    <li
                      key={enrollment.lessonSessionId}
                      className={cn('w-full shrink-0 snap-start pr-0')}
                    >
                    <Link
                      to="/learner/courses/$courseId"
                      params={{ courseId: enrollment.course.id }}
                        className="group block h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-sky-300"
                    >
                        {(() => {
                          const publishedMeta = publishedCourseMetaById.get(
                            enrollment.course.id,
                          );
                          const enrollmentTags = enrollment.course.tags ?? [];
                          const tags =
                            enrollmentTags.length > 0
                              ? enrollmentTags
                              : (publishedMeta?.tags ?? []);
                          const imageUrl =
                            enrollment.course.imageUrl ?? publishedMeta?.imageUrl;
                          const creatorName =
                            enrollment.course.creatorUsername ??
                            publishedMeta?.creatorUsername ??
                            'Course creator';
                          const statusLabel =
                            enrollment.status === 'COMPLETED'
                              ? 'Completed'
                              : enrollment.status === 'ENROLLED'
                                ? 'In Progress'
                                : 'Enrolled';

                          return (
                            <>
                        <div className="relative h-44 w-full overflow-hidden bg-slate-200">
                              {imageUrl ? (
                            <img
                                  src={imageUrl}
                              alt={enrollment.course.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
                              No thumbnail
                            </div>
                          )}
                          <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center rounded-full border border-slate-300 bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700">
                                {statusLabel}
                          </span>
                              <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center rounded-full border border-slate-300 bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700">
                                By {creatorName}
                              </span>
                        </div>
                        <div className="p-4">
                          <p className="line-clamp-2 text-base leading-snug font-semibold text-slate-900">
                          {enrollment.course.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Updated {dayjs(enrollment.course.updatedAt).fromNow()}
                          </p>
                              <div className="mt-3 flex items-end justify-between gap-3">
                                <div className="flex min-w-0 flex-wrap gap-1.5">
                                  {tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <p className="shrink-0 text-sm font-semibold text-sky-700 underline-offset-4 group-hover:underline">
                                  View course
                                </p>
                              </div>
                        </div>
                            </>
                          );
                        })()}
                    </Link>
                  </li>
                ))}
                </ul>
              </div>
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
