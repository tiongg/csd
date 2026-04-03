import { Button } from '@/components/ui/button';
import useEnrolledCourse from '@/context/EnrolledCourseContext';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { CourseCard } from '../course-card/CourseCard';

type EnrolledCoursesProps = {
  searchQuery: string;
};

export function EnrolledCourses({ searchQuery }: EnrolledCoursesProps) {
  const { enrolledCourses } = useEnrolledCourse();

  const filteredCourses = enrolledCourses.filter((enrollment) =>
    enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (filteredCourses.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">No courses yet</p>
          <p className="mb-4 text-sm text-slate-600">
            Explore our course catalog to start learning.
          </p>
          <Button asChild>
            <Link
              to="/learner/discover"
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-white transition-colors hover:bg-sky-700"
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {filteredCourses.map((enrollment) => (
        <CourseCard
          key={enrollment.lessonSessionId}
          course={enrollment.course}
          enrollment={enrollment}
        />
      ))}
    </div>
  );
}
