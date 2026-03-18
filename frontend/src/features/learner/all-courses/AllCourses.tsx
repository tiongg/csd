import useEnrolledCourse from '@/context/EnrolledCourseContext';
import { useApiQuery } from '@/lib/fetch-client';
import { CourseCard } from '../course-card/CourseCard';

type AllCoursesProps = {
  searchQuery: string;
};

export function AllCourses({ searchQuery }: AllCoursesProps) {
  const {
    data: courses,
    isLoading,
    isError,
  } = useApiQuery('get', '/api/courses/published', {});
  const { enrolledCourses } = useEnrolledCourse();

  const filteredCourses = (courses ?? []).filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
        <p className="animate-pulse text-sm">Loading courses...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
        <p className="text-sm">
          Failed to load courses. Please try again later.
        </p>
      </div>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
        <p className="text-lg font-semibold">No courses found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredCourses.map((course) => {
        const enrollment = enrolledCourses.find((e) => e.course.id === course.id);
        return (
          <CourseCard key={course.id} course={course} enrollment={enrollment} />
        );
      })}
    </div>
  );
}
