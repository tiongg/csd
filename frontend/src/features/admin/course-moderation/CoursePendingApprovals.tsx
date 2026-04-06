import { useApiQuery } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { CourseModerationCard } from './CourseModerationCard';

type CoursePendingApprovalsProps = {
  searchQuery: string;
  categoryFilter: string;
  sortOption: 'newest' | 'oldest' | 'title-asc' | 'title-desc';
};

export function CoursePendingApprovals({
  searchQuery,
  categoryFilter,
  sortOption,
}: CoursePendingApprovalsProps) {
  const { data: pendingCourses } = useApiQuery(
    'get',
    '/api/content-versions/pending',
  );
  const navigate = useNavigate();
  const filteredPendingCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matchesFilters = (pendingCourses ?? []).filter(
      ({ course, contentVersion }) => {
      const searchableText = [
        course.title,
        course.description ?? '',
        course.creatorUsername ?? '',
        course.category ?? '',
        `version ${contentVersion.versionNumber}`,
        dayjs(contentVersion.publishedAt).format('MMM D, YYYY'),
        ...(course.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      const matchesCategory =
        categoryFilter === '__all__' || course.category === categoryFilter;

      const matchesSearch = !query || searchableText.includes(query);
      return matchesSearch && matchesCategory;
      },
    );

    return [...matchesFilters].sort((a, b) => {
      if (sortOption === 'title-asc') {
        return a.course.title.localeCompare(b.course.title, undefined, {
          sensitivity: 'base',
        });
      }
      if (sortOption === 'title-desc') {
        return b.course.title.localeCompare(a.course.title, undefined, {
          sensitivity: 'base',
        });
      }

      const aDate = dayjs(a.contentVersion.publishedAt).valueOf();
      const bDate = dayjs(b.contentVersion.publishedAt).valueOf();
      return sortOption === 'oldest' ? aDate - bDate : bDate - aDate;
    });
  }, [categoryFilter, pendingCourses, searchQuery, sortOption]);
  const query = searchQuery.trim();
  const hasActiveFilters = query.length > 0 || categoryFilter !== '__all__';

  if (!pendingCourses) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/70 py-10 text-center text-slate-500">
        Loading pending courses...
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3">
        {filteredPendingCourses.length === 0 ? (
          <div className="col-span-full flex min-h-[28rem] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/55 p-8 text-center text-slate-500">
            <p className="text-base font-semibold text-slate-700">
              {hasActiveFilters
                ? 'No pending courses match the current filters.'
                : 'No pending course approvals'}
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
