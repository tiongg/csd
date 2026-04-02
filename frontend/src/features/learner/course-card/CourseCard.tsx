import type { Course, EnrolledCourse } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

type CourseCardProps = {
  course: Course;
  enrollment?: EnrolledCourse;
};

export function CourseCard({ course, enrollment }: CourseCardProps) {
  const { title, description, id, tags, imageUrl } = course;
  return (
    <Link
      to="/learner/courses/$courseId"
      params={{ courseId: id }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-300/85 bg-slate-100/70 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50/30"
    >
      <div className="aspect-video w-full overflow-hidden bg-slate-200">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex h-full flex-col justify-between p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-base font-semibold text-slate-900">
              {title}
            </p>
            {enrollment && (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  enrollment.status === 'COMPLETED'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-sky-200 bg-sky-50 text-sky-700',
                )}
              >
                {enrollment.status === 'COMPLETED' ? 'Completed' : 'Enrolled'}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-slate-600">
            {description || 'No description'}
          </p>
          <div className="flex flex-wrap gap-1">
            {tags?.map((tag) => (
              <span
                key={tag}
                className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
