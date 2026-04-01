import { EngagementFunnel } from './EngagementFunnel';
import { EmptyMetricState } from './EmptyMetricState';
import type { EngagementSummary, Timeframe } from '../contributor-utils';

type CourseEngagementMetricProps = {
  engagementSummary: EngagementSummary;
  timeframe: Timeframe;
};

export function CourseEngagementMetric({
  engagementSummary,
  timeframe,
}: CourseEngagementMetricProps) {
  const hasData = engagementSummary.totalEnrollments > 0;

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">
          Engagement Funnel
        </p>
        <p className="text-xs text-slate-500">{timeframe} view</p>
      </div>
      {!hasData ? (
        <EmptyMetricState message="Create contributor courses to unlock funnel analytics here." />
      ) : (
        <EngagementFunnel engagementSummary={engagementSummary} />
      )}
    </>
  );
}
