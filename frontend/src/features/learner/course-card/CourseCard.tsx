import type { Course, EnrolledCourse } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

type CourseCardProps = {
  course: Course;
  enrollment?: EnrolledCourse;
  variant?: 'discover' | 'enrolled';
};

type CourseWithCreatorMeta = Course & {
  creatorUsername?: string;
  creator?: {
    username?: string;
  };
  createdBy?: {
    username?: string;
  };
};

export function CourseCard({
  course,
  enrollment,
  variant = 'enrolled',
}: CourseCardProps) {
  const { title, description, id, tags, imageUrl, category } = course;
  const courseWithCreatorMeta = course as CourseWithCreatorMeta;
  const creatorName =
    courseWithCreatorMeta.creatorUsername ??
    courseWithCreatorMeta.creator?.username ??
    courseWithCreatorMeta.createdBy?.username;
  const creatorLabel = creatorName ?? 'Course creator';
  const summary = description || 'No description';

  return (
    <Link
      to="/learner/courses/$courseId"
      params={{ courseId: id }}
      className="group block h-full overflow-hidden rounded-2xl border border-slate-300 bg-white/85 transition-colors hover:border-slate-400"
    >
      <div className="relative h-64 w-full overflow-hidden bg-slate-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
            No image
          </div>
        )}
        {variant === 'enrolled' && enrollment && (
          <span
            className={cn(
              'pointer-events-none absolute top-3 left-3 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
              enrollment.status === 'COMPLETED'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-white/95 text-slate-700',
            )}
          >
            {enrollment.status === 'COMPLETED' ? 'Completed' : 'Enrolled'}
          </span>
        )}
        <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center rounded-full border border-slate-300 bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700">
          By {creatorLabel}
        </span>
      </div>
      <div className="p-5">
        <div>
          <div className="mb-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {category}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-xl leading-snug font-semibold text-slate-900">
              {title}
            </h3>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {summary}
          </p>
          {variant === 'enrolled' && (
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="shrink-0 text-sm font-semibold text-sky-700 underline-offset-4 group-hover:underline">
                View course
              </p>
            </div>
          )}
          {variant === 'discover' && (
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="shrink-0 text-sm font-semibold text-sky-700 underline-offset-4 group-hover:underline">
                View course
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
