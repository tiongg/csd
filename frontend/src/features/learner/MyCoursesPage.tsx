import { Heading1 } from '@/components/ui/typography';
import useEnrolledCourse from '@/context/EnrolledCourseContext';
import { useMemo, useState } from 'react';
import { DiscoverBrowseToolbar } from './discover/DiscoverBrowseToolbar';
import { EnrolledCourses } from './enrolled-courses/EnrolledCourses';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

export default function MyCoursesPage() {
  const { enrolledCourses } = useEnrolledCourse();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('__all__');

  const categoryOptions = useMemo(() => {
    const categories = new Set(
      enrolledCourses.map((enrollment) => enrollment.course.category).filter(Boolean),
    );

    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [enrolledCourses]);

  return (
    <div className="flex min-h-0 flex-1 flex-col w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex min-h-0 flex-1 w-full max-w-6xl flex-col gap-5">
        <section className={glassPanelClass}>
          <div className="flex flex-col gap-4">
            <div>
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
                Learning Hub
              </div>
              <Heading1 className="mt-3 text-slate-900">My Courses</Heading1>
              <p className="mt-2 text-sm text-slate-600">
                Track your enrolled courses and continue your learning journey.
              </p>
            </div>
          </div>
        </section>

        <section className={`${glassPanelClass} flex flex-1 flex-col`}>
          <div className="flex h-full flex-1 flex-col gap-4">
            <DiscoverBrowseToolbar
              title="Continue Learning"
              searchPlaceholder="Search enrolled courses"
              onSearchQueryChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categoryOptions={categoryOptions}
              showMyPreferencesOption={false}
            />

            <div className="flex flex-1">
              <EnrolledCourses
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
