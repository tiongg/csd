import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';

type ReviewQueueCourse = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  updatedAt: string;
};

type ReviewQueueCourseItemProps = {
  course: ReviewQueueCourse;
};

export function ReviewQueueCourseItem({ course }: ReviewQueueCourseItemProps) {
  return (
    <Link
      to="/contributor/editor/$courseId"
      params={{ courseId: course.id }}
      search={{ section: undefined }}
      className="group block rounded-xl border border-slate-300 bg-white p-3 transition-colors hover:border-slate-400"
    >
      <div className="flex gap-3">
        <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:h-28 sm:w-44">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              No thumbnail
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-semibold text-slate-900">
              {course.title}
            </p>
            <span className="shrink-0 rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              Pending
            </span>
          </div>

          {course.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
              {course.description}
            </p>
          )}

          <p className="mt-1 text-xs text-slate-500">
            Updated {dayjs(course.updatedAt).fromNow()}
          </p>

        </div>
      </div>
    </Link>
  );
}
