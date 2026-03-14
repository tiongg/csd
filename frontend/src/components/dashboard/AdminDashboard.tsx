import { useApiQuery } from '@/lib/fetch-client';
import { InfoCard } from './InfoCard';

export function AdminDashboard() {
  const { data: allCourses } = useApiQuery('get', '/api/courses/', {});
  const { data: pendingContributors } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {},
  );
  const { data: pendingCourses } = useApiQuery(
    'get',
    '/api/content-versions/pending',
    {},
  );

  const totalPublishedCourses = (allCourses ?? []).length;
  const pendingContributorApps = pendingContributors?.length ?? 0;
  const pendingCourseReviews = pendingCourses?.length ?? 0;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex justify-between gap-4">
        <InfoCard
          title="Pending Approvals"
          value={pendingContributorApps.toString()}
          variant={pendingContributorApps > 0 ? 'danger' : 'default'}
        />
        <InfoCard
          title="Courses Pending Review"
          value={pendingCourseReviews.toString()}
          variant={pendingCourseReviews > 0 ? 'warning' : 'default'}
        />
        <InfoCard
          title="Published Courses"
          value={totalPublishedCourses.toString()}
          variant="default"
        />
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-slate-400 p-4 xl:px-8">
        <img
          src="/assets/admin.jpeg"
          className="h-full rounded-md"
          alt="placeholder admin image"
        />
        <div className="animate-pulse pt-4 text-slate-500 italic">
          More coming soon...
        </div>
      </div>
    </div>
  );
}
