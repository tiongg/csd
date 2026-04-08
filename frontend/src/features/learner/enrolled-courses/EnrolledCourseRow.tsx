import { cn, type Course, type EnrolledCourse } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';
import { Link } from '@tanstack/react-router';

type EnrolledCourseRowProps = {
  course: Course;
  enrollment: EnrolledCourse;
};

export function EnrolledCourseRow({
  course,
  enrollment,
}: EnrolledCourseRowProps) {
  const creatorLabel = course.creatorUsername ?? 'Course creator';
  const summary =
    course.description?.trim() ||
    'No description available for this course yet.';
  const tags = course.tags ?? [];
  const visibleTags = tags.slice(0, 4);
  const hiddenTagsCount = tags.length - visibleTags.length;

  return (
    <Link
      to="/learner/courses/$courseId"
      params={{ courseId: course.id }}
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors duration-150 hover:border-slate-300"
    >
      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 md:aspect-auto md:min-h-[210px] md:border-r md:border-slate-200">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              No image
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {course.category}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                  enrollment.status === 'COMPLETED'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-sky-200 bg-sky-50 text-sky-700',
                )}
              >
                {enrollment.status === 'COMPLETED' ? 'Completed' : 'Enrolled'}
              </span>
              <span className="inline-flex max-w-full items-center rounded-full border border-slate-300 bg-white/95 px-2 py-0.5 text-xs font-medium text-slate-700">
                <span className="truncate">By {creatorLabel}</span>
              </span>
            </div>
            <span className="shrink-0 text-xs font-medium whitespace-nowrap text-slate-500">
              Updated {dayjs(course.updatedAt).fromNow()}
            </span>
          </div>

          <h3 className="mt-2 line-clamp-1 text-base font-bold text-slate-900 sm:text-lg">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-slate-600">
            {summary}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {visibleTags.length > 0 ? (
                <>
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {hiddenTagsCount > 0 && (
                    <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      +{hiddenTagsCount} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-500">No tags</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 underline-offset-4 group-hover:underline">
              Open course
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
