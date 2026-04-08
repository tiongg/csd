import { Link } from '@tanstack/react-router';

type InProgressCourseCarouselItemProps = {
  courseId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  creatorName: string;
};

export function InProgressCourseCarouselItem({
  courseId,
  title,
  description,
  imageUrl,
  creatorName,
}: InProgressCourseCarouselItemProps) {
  return (
    <Link
      to="/learner/courses/$courseId"
      params={{ courseId }}
      className="group block h-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-colors hover:border-slate-400"
    >
      <div className="flex h-full gap-3 p-3 md:gap-4 md:p-4">
        <div className="w-[16.25rem] shrink-0 self-stretch overflow-hidden rounded-lg bg-slate-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
              No thumbnail
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              Enrolled
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
              By {creatorName}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-base leading-snug font-semibold text-slate-900">
            {title}
          </p>
          {description && (
            <p className="mt-1 line-clamp-6 text-sm text-slate-600">
              {description}
            </p>
          )}
          <div className="mt-auto flex items-end justify-end gap-3 pt-3">
            <p className="shrink-0 text-sm font-semibold text-slate-700 underline-offset-4 group-hover:underline">
              View course
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
