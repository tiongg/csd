import { useApiQuery } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { CourseModerationCard } from './CourseModerationCard';

export function CoursePendingApprovals() {
  const { data: pendingCourses } = useApiQuery(
    'get',
    '/api/content-versions/pending',
  );
  const navigate = useNavigate();

  if (!pendingCourses) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/70 py-10 text-center text-slate-500">
        Loading pending courses...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pendingCourses.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white/55 py-12 text-center text-slate-500">
            No pending course approvals
          </div>
        ) : (
          pendingCourses.map(({ course, contentVersion }) => (
            <CourseModerationCard
              key={course.id}
              title={course.title}
              versionNumber={contentVersion.versionNumber}
              dateLabel={`Submitted ${dayjs(contentVersion.publishedAt).format('MMM D, YYYY')}`}
              description={course.description}
              imageUrl={course.imageUrl}
              tags={course.tags ?? []}
              onClick={() =>
                navigate({
                  to: '/admin/review/$versionId',
                  params: { versionId: contentVersion.id },
                })
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
