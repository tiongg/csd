import { useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { CourseModerationCard } from './CourseModerationCard';

type AllPublishedCoursesProps = {
  searchQuery: string;
};

export function AllPublishedCourses({ searchQuery }: AllPublishedCoursesProps) {
  const { data: courses } = useApiQuery('get', '/api/courses/published');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setFeaturedMutation = useApiMutation(
    'put',
    '/api/courses/{id}/featured',
  );

  const handleSetFeatured = (courseId: string, isFeatured: boolean) => {
    setFeaturedMutation.mutate(
      {
        params: { path: { id: courseId as any }, query: { isFeatured } },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['get', '/api/courses/published'],
          });
        },
      },
    );
  };

  const courseList = courses ?? [];

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return courseList;

    return courseList.filter(({ course }) => {
      const inTitle = course.title.toLowerCase().includes(query);
      const inDescription = (course.description ?? '')
        .toLowerCase()
        .includes(query);
      const inTags = (course.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(query),
      );

      return inTitle || inDescription || inTags;
    });
  }, [courseList, searchQuery]);

  if (!courses) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/70 py-10 text-center text-slate-500">
        Loading courses...
      </div>
    );
  }

  if (courseList.length === 0) {
    return (
      <div className="flex min-h-[28rem] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/55 p-8 text-center">
        <div>
          <p className="text-base font-semibold text-slate-700">
            No approved courses yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Approved courses will appear here after moderation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/55 py-12 text-center text-slate-500">
          No approved courses match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredCourses.map(({ course, contentVersion }) => (
            <CourseModerationCard
              key={course.id}
              title={course.title}
              creatorUsername={course.creatorUsername}
              versionNumber={contentVersion.versionNumber}
              dateLabel={`Updated ${dayjs(course.updatedAt).format('MMM D, YYYY')}`}
              description={course.description}
              imageUrl={course.imageUrl}
              tags={course.tags ?? []}
              category={course.category}
              isFeatured={course.isFeatured}
              onToggleFeatured={() =>
                handleSetFeatured(course.id, !course.isFeatured)
              }
              onClick={() =>
                navigate({
                  to: '/admin/review/$versionId',
                  params: { versionId: contentVersion.id },
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
