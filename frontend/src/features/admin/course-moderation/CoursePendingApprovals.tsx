import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiQuery } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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
                    {dayjs(course.createdAt).format('MMM D, YYYY')}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="line-clamp-3 text-sm text-slate-600">
                  {contentVersion.description || 'No description provided'}
                </p>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  Submitted {dayjs(contentVersion.publishedAt).fromNow()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
