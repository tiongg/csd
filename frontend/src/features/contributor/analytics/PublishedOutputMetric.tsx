import { BarMetricChart } from './BarMetricChart';
import { EmptyMetricState } from './EmptyMetricState';
import type { BarMetricPoint } from '../contributor-utils';

type PublishedOutputMetricProps = {
  courses: unknown[];
  publishedOutputPoints: BarMetricPoint[];
};

export function PublishedOutputMetric({
  courses,
  publishedOutputPoints,
}: PublishedOutputMetricProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">
          Published Output Trend
        </p>
        <p className="text-xs text-slate-500">
          Courses/releases shipped in this period
        </p>
      </div>
      {courses.length === 0 ? (
        <EmptyMetricState message="Publish-ready contributor courses will show output trends here." />
      ) : (
        <BarMetricChart points={publishedOutputPoints} />
      )}
    </>
  );
}
