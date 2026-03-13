import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/lib/fetch-client';
import type { Course } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';

type EnrolledCoursesProps = {
  searchQuery: string;
};

type CourseCardProps = {
  course: Course;
};

function CourseCard({ course }: CourseCardProps) {
  const { title, updatedAt, id } = course;
  return (
    <Link
      to="/learner/courses/$courseId"
      params={{ courseId: id }}
      className="group bg-card relative cursor-pointer overflow-hidden rounded-lg border-2 border-slate-200 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-full flex-col justify-between p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <ClockIcon className="size-4" />
            <span>Last updated: {dayjs(updatedAt).fromNow()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function EnrolledCourses({ searchQuery }: EnrolledCoursesProps) {
  // TODO: Only fetch courses that the user is enrolled in, not all courses
  const {
    data: courses,
    isLoading,
    isError,
  } = useApiQuery('get', '/api/courses/');
  const filteredCourses = (courses ?? []).filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.creatorId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-500">
        <p className="animate-pulse text-sm">Loading courses...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-500">
        <p className="text-sm">
          Failed to load courses. Please try again later.
        </p>
      </div>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg font-semibold">No courses yet</p>
          <p className="mb-4 text-sm">
            Explore our course catalog to start learning!
          </p>
          <Button asChild>
            <Link
              to="/learner/discover"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
            >
              <CheckCircleIcon className="size-5" />
              Explore Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
