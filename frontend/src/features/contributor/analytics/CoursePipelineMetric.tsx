import { BarMetricChart } from './BarMetricChart';
import { EmptyMetricState } from './EmptyMetricState';
import type { BarMetricPoint } from '../contributor-utils';

type CoursePipelineMetricProps = {
  courses: unknown[];
  quizScorePoints: BarMetricPoint[];
};

export function CoursePipelineMetric({
  courses,
  quizScorePoints,
}: CoursePipelineMetricProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">
          Quiz Average Scores Over Time
        </p>
        <p className="text-xs text-slate-500">
          Average quiz score trend by timeframe
        </p>
      </div>
      {courses.length === 0 ? (
        <EmptyMetricState message="Quiz score trends appear once courses start receiving learner attempts." />
      ) : (
        <BarMetricChart points={quizScorePoints} />
      )}
    </>
  );
}
