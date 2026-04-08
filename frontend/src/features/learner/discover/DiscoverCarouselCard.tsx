import { Link } from '@tanstack/react-router';
import { type DiscoverCourse } from './types';

type DiscoverCarouselCardProps = {
  course: DiscoverCourse;
  compact?: boolean;
};

export function DiscoverCarouselCard({
  course,
  compact = false,
}: DiscoverCarouselCardProps) {
  return (
    <Link
      to="/learner/courses/$courseId"
      params={{ courseId: course.id }}
      className="group block h-full overflow-hidden rounded-xl border border-slate-300 bg-white transition-colors hover:border-slate-400"
    >
      <div
        className={compact ? 'relative h-48 w-full overflow-hidden' : 'relative h-64 w-full overflow-hidden'}
      >
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
            No image
          </div>
        )}
        <span className="pointer-events-none absolute right-3 bottom-3 inline-flex max-w-[75%] items-center truncate rounded-full border border-slate-300 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700">
          By {course.creatorLabel}
        </span>
      </div>

      <div className={compact ? 'flex flex-col p-3' : 'flex flex-col p-4'}>
        <p className="line-clamp-2 text-sm font-semibold text-slate-900">
          {course.title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">
          {course.description || 'No description provided'}
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {course.tags.slice(0, 4).map((tag) => (
              <span
                key={`${course.id}-${tag}`}
                className="inline-flex max-w-[140px] items-center truncate rounded-full border border-sky-200 bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700"
              >
                {tag}
              </span>
            ))}
            {course.tags.length > 4 && (
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                +{course.tags.length - 4}
              </span>
            )}
          </div>
          <p className="shrink-0 text-xs font-semibold text-slate-700 underline-offset-4 group-hover:underline">
            View
          </p>
        </div>
      </div>
    </Link>
  );
}
