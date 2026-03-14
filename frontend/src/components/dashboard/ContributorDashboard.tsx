import { useApiQuery } from '@/lib/fetch-client';
import TrendsPage from '../TrendsPage';
import { InfoCard } from './InfoCard';

export function ContributorDashboard() {
  const { data: allCourses } = useApiQuery('get', '/api/courses/', {});

  const totalPublishedCourses = (allCourses ?? []).length;
  const awaitingApproval = (allCourses ?? []).length;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex justify-between gap-4">
        <InfoCard
          title="Awaiting Approvals"
          value={awaitingApproval.toString()}
          variant={awaitingApproval > 0 ? 'warning' : 'default'}
        />
        <InfoCard
          title="Published Courses"
          value={totalPublishedCourses.toString()}
          variant="default"
        />
      </div>
      <div className="flex h-full">
        <TrendsPage />
      </div>
    </div>
  );
}
