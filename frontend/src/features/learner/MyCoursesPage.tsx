import { Heading1 } from '@/components/ui/typography';
import useEnrolledCourse from '@/context/EnrolledCourseContext';
import { useMemo, useState } from 'react';
import { DiscoverBrowseToolbar } from './discover/DiscoverBrowseToolbar';
import { EnrolledCourses } from './enrolled-courses/EnrolledCourses';

export default function MyCoursesPage() {
  const { enrolledCourses } = useEnrolledCourse();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('__all__');

  const categoryOptions = useMemo(() => {
    const categories = new Set(
      enrolledCourses
        .map((enrollment) => enrollment.course.category)
        .filter(Boolean),
    );

    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [enrolledCourses]);

  return (
    <div className="flex">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-6">
        <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            My Learning
          </p>
          <Heading1 className="mt-3 text-slate-900">My Courses</Heading1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Browse your enrolled courses in a simpler list and jump back into the next lesson faster.
          </p>
        </section>

        <section className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex h-full flex-1 flex-col gap-4">
            <DiscoverBrowseToolbar
              title="Enrolled Course List"
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
