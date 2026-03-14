import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { useApiQuery } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';

export function CoursePendingApprovals() {
  const { data: pendingCourses } = useApiQuery(
    'get',
    '/api/content-versions/pending',
  );
  const navigate = useNavigate();

  if (!pendingCourses) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <h3 className="text-lg font-semibold text-slate-700">
        {pendingCourses.length} Pending{' '}
        {pendingCourses.length === 1 ? 'Course' : 'Courses'}
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pendingCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No pending course approvals
          </div>
        ) : (
          pendingCourses.map(({ course, contentVersion }) => (
            <Card
              key={course.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() =>
                navigate({
                  to: '/admin/review/$versionId',
                  params: { versionId: contentVersion.id },
                })
              }
            >
              <CardContent>
                <div className="space-y-1">
                  <CardTitle>{course.title}</CardTitle>
                  <Badge>Version {contentVersion.versionNumber}</Badge>
                  <CardDescription>
                    {contentVersion.description || 'No description provided'}
                  </CardDescription>
                  <p className="text-xs text-slate-500">
                    {dayjs(course.createdAt).format('MMM D, YYYY · h:mm A')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
