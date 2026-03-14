import type { Course, EnrolledCourse } from '@/lib/utils';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

type CourseCardProps = {
  course: Course;
  enrollment?: EnrolledCourse;
};

export function CourseCard({ course, enrollment }: CourseCardProps) {
  const { title, description, updatedAt, id } = course;
  return (
    <Link
      to="/learner/courses/$courseId"
      params={{ courseId: id }}
      className="group bg-card relative cursor-pointer overflow-hidden rounded-lg border-2 border-slate-200 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-full flex-col justify-between p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg font-semibold text-slate-900">{title}</p>
            {enrollment && (
              <span
                className={cn(
                  'flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  enrollment.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800',
                )}
              >
                {enrollment.status === 'COMPLETED' ? 'Completed' : 'Enrolled'}
              </span>
            )}
          </div>
          <p className="truncate text-sm text-gray-500">
            {description || 'No description'}
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <ClockIcon className="size-4" />
            <span>Last updated: {dayjs(updatedAt).fromNow()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
