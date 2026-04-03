import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiQuery } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useMemo } from 'react';

type AllPublishedCoursesProps = {
  searchQuery: string;
};

export function AllPublishedCourses({ searchQuery }: AllPublishedCoursesProps) {
  const { data: courses } = useApiQuery('get', '/api/courses/published');
  const navigate = useNavigate();
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(({ course, contentVersion }) => (
            <Card
              key={course.id}
              className="cursor-pointer overflow-hidden border-slate-200/80 bg-white/75 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
              onClick={() =>
                navigate({
                  to: '/admin/review/$versionId',
                  params: { versionId: contentVersion.id },
                })
              }
            >
              <CardHeader className="space-y-2 pb-3">
                <CardTitle className="line-clamp-2 text-base text-slate-900">
                  {course.title}
                </CardTitle>
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full border-sky-200 bg-sky-50 text-sky-700"
                  >
                    Version {contentVersion.versionNumber}
                  </Badge>
                  <p className="text-xs text-slate-500">
                    Updated {dayjs(course.updatedAt).format('MMM D, YYYY')}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="line-clamp-3 text-sm text-slate-600">
                  {course.description || 'No description provided'}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(course.tags ?? []).length > 0 ? (
                    (course.tags ?? []).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full border-slate-300 bg-slate-100/70 text-slate-700"
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No tags</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
