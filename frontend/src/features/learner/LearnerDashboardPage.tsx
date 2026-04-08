import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import useEnrolledCourse from '@/context/EnrolledCourseContext';
import { useResizableSplit } from '@/features/dashboard/useResizableSplit';
import { useApiQuery } from '@/lib/fetch-client';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { InProgressCourseCarouselItem } from './dashboard/InProgressCourseCarouselItem';
import { KeywordCourseSearchDialog } from './dashboard/KeywordCourseSearchDialog';
import PersonalAnalytics from './dashboard/PersonalAnalytics';
import { TopTrendsTable } from './dashboard/TopTrendsTable';

export default function LearnerDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.realname?.trim() || user?.username;
  const { enrolledCourses } = useEnrolledCourse();
  const { data: publishedCourses } = useApiQuery('get', '/api/courses/published');
  const { splitContainerRef, splitStyle, startResizing } = useResizableSplit();
  const [isCourseMatchOpen, setIsCourseMatchOpen] = useState(false);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const publishedCourseMetaById = useMemo(() => {
    const map = new Map<
      string,
      { imageUrl?: string; creatorUsername?: string }
    >();
    (publishedCourses ?? []).forEach(({ course }) => {
      map.set(course.id, {
        imageUrl: course.imageUrl,
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

  useEffect(() => {
    setActiveCourseIndex(0);
  }, [inProgressCourses.length]);

  useEffect(() => {
    if (inProgressCourses.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveCourseIndex((prev) => (prev + 1) % inProgressCourses.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [inProgressCourses.length]);

  function goToNextCourse() {
    setActiveCourseIndex((prev) => (prev + 1) % inProgressCourses.length);
  }

  function goToPreviousCourse() {
    setActiveCourseIndex(
      (prev) => (prev - 1 + inProgressCourses.length) % inProgressCourses.length,
    );
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (inProgressCourses.length <= 1 || touchStartXRef.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;

    const deltaX = touchStartXRef.current - touchEndX;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 40) return;

    if (deltaX > 0) {
      goToNextCourse();
      return;
    }
    goToPreviousCourse();
  }

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
                Enrolled Courses
              </h2>
              <p className="text-sm text-slate-500">
                {inProgressCourses.length} active
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Continue where you left off.
            </p>

            {inProgressCourses.length > 0 ? (
              <div
                className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <ul
                  className="flex min-h-0 flex-1 transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${activeCourseIndex * 100}%)` }}
                >
                  {inProgressCourses.map((enrollment) => {
                    const publishedMeta = publishedCourseMetaById.get(
                      enrollment.course.id,
                    );
                    const imageUrl =
                      enrollment.course.imageUrl ?? publishedMeta?.imageUrl;
                    const creatorName =
                      enrollment.course.creatorUsername ??
                      publishedMeta?.creatorUsername ??
                      'Course creator';

                    return (
                      <li
                        key={enrollment.lessonSessionId}
                        className="w-full min-w-full shrink-0"
                      >
                        <InProgressCourseCarouselItem
                          courseId={enrollment.course.id}
                          title={enrollment.course.title}
                          description={enrollment.course.description ?? undefined}
                          imageUrl={imageUrl}
                          creatorName={creatorName}
                        />
                      </li>
                    );
                  })}
                </ul>
                {inProgressCourses.length > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    {inProgressCourses.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        type="button"
                        onClick={() => setActiveCourseIndex(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === activeCourseIndex
                            ? 'w-5 bg-sky-500'
                            : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to in-progress course ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
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
            title="Trending"
            description="Top signals to monitor."
            onTrendClick={(trendName) => {
              setKeywordSearch(trendName);
              setIsCourseMatchOpen(true);
            }}
          />
        </div>

        <KeywordCourseSearchDialog
          initialSearchValue={keywordSearch}
          open={isCourseMatchOpen}
          onOpenChange={setIsCourseMatchOpen}
        />
      </div>
    </div>
  );
}
