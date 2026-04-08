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
    <div className="flex min-h-0 w-full flex-1 flex-col bg-slate-100 p-6 md:p-8">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm md:px-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
            My learning
          </p>
          <Heading1 className="mt-3 text-slate-900">My Courses</Heading1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Browse your enrolled courses in a simpler list and jump back into
            the next lesson faster.
          </p>
        </section>

        <section className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex h-full flex-1 flex-col gap-4">
            <DiscoverBrowseToolbar
              title="Your Course List"
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
