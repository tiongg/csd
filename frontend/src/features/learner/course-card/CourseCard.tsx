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
  const { title, description, id, tags, imageUrl } = course;
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
      className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white/85 transition-colors hover:border-sky-300"
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
      </div>
      <div className="p-5">
        {variant === 'discover' ? (
          <div>
            <h3 className="line-clamp-2 text-xl leading-snug font-semibold text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-600">
              By {creatorLabel}
            </p>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
              {summary}
            </p>
            <p className="mt-4 text-sm font-semibold text-sky-700 underline-offset-4 group-hover:underline">
              View course
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-xl leading-snug font-semibold text-slate-900">
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
            <p className="text-sm font-medium text-slate-600">By {creatorLabel}</p>
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
              {summary}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
