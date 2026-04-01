import { BarMetricChart } from './BarMetricChart';
import { EmptyMetricState } from './EmptyMetricState';
import type { BarMetricPoint } from '../contributor-utils';

type PublishedOutputMetricProps = {
  publishedOutputPoints: BarMetricPoint[];
};

export function PublishedOutputMetric({
  publishedOutputPoints,
}: PublishedOutputMetricProps) {
  const hasData = publishedOutputPoints.some((p) => p.value > 0);

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
      {!hasData ? (
        <EmptyMetricState message="Publish-ready contributor courses will show output trends here." />
      ) : (
        <BarMetricChart points={publishedOutputPoints} />
      )}
    </>
  );
}
