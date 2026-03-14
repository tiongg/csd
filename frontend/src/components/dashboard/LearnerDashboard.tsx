import { useApiQuery } from '@/lib/fetch-client';
import TrendsPage from '../TrendsPage';
import { InfoCard } from './InfoCard';

export function LearnerDashboard() {
  const { data: allCourses } = useApiQuery('get', '/api/courses/', {});

  const totalPublishedCourses = (allCourses ?? []).length;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex justify-between gap-4">
        <InfoCard title="Daily Streak" value="4" variant="danger" />
        <InfoCard title="Current Rank" value="Top 10%" variant="default" />
        <InfoCard
          title="Total Courses"
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
