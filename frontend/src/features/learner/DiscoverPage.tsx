import SearchBar from '@/components/ui/searchbar';
import { Heading1 } from '@/components/ui/typography';
import { useApiQuery } from '@/lib/fetch-client';
import { useMemo, useState } from 'react';
import { CourseCard } from './course-card/CourseCard';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: courses,
    isLoading,
    isError,
  } = useApiQuery('get', '/api/courses/published', {});

  const filteredCourses = useMemo(
    () =>
      (courses ?? []).filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [courses, searchQuery],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex min-h-0 flex-1 w-full max-w-6xl flex-col gap-5">
        <section className={glassPanelClass}>
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
            Discover
          </div>
          <Heading1 className="mt-3 text-slate-900">Explore Courses</Heading1>
          <p className="mt-2 text-sm text-slate-600">
            Browse all existing published courses.
          </p>
        </section>

        <section className={`${glassPanelClass} flex flex-1 flex-col`}>
          <div className="mb-4 flex justify-end">
            <div className="w-full sm:w-72">
              <SearchBar placeholder="Search courses" onSearch={setSearchQuery} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="animate-pulse text-sm">Loading courses...</p>
            </div>
          ) : isError ? (
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="text-sm">Failed to load courses. Please try again later.</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="text-lg font-semibold">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
