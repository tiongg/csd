import { useApiQuery } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { CourseModerationCard } from './CourseModerationCard';

type CoursePendingApprovalsProps = {
  searchQuery: string;
};

export function CoursePendingApprovals({ searchQuery }: CoursePendingApprovalsProps) {
  const { data: pendingCourses } = useApiQuery(
    'get',
    '/api/content-versions/pending',
  );
  const navigate = useNavigate();
  const filteredPendingCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return pendingCourses ?? [];
    }

    return (pendingCourses ?? []).filter(({ course }) => {
      const inTitle = course.title.toLowerCase().includes(query);
      const inDescription = (course.description ?? '')
        .toLowerCase()
        .includes(query);
      const inTags = (course.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(query),
      );

      return inTitle || inDescription || inTags;
    });
  }, [pendingCourses, searchQuery]);
  const query = searchQuery.trim();

  if (!pendingCourses) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/70 py-10 text-center text-slate-500">
        Loading pending courses...
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredPendingCourses.length === 0 ? (
          <div className="col-span-full flex min-h-[28rem] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/55 p-8 text-center text-slate-500">
            <p className="text-base font-semibold text-slate-700">
              {query ? 'No pending courses match your search.' : 'No pending course approvals'}
            </p>
          </div>
        ) : (
          filteredPendingCourses.map(({ course, contentVersion }) => (
            <CourseModerationCard
              key={course.id}
              title={course.title}
              creatorUsername={course.creatorUsername}
              versionNumber={contentVersion.versionNumber}
              dateLabel={`Submitted ${dayjs(contentVersion.publishedAt).format('MMM D, YYYY')}`}
              description={course.description}
              imageUrl={course.imageUrl}
              tags={course.tags ?? []}
              category={course.category}
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
