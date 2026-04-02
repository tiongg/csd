import type { BarMetricPoint } from '../contributor-utils';
import BarMetricChart from './BarMetricChart';
import EmptyMetricState from './EmptyMetricState';

type EnrollmentTrendMetricProps = {
  enrollmentTrendPoints: BarMetricPoint[];
};

export default function EnrollmentTrendMetric({
  enrollmentTrendPoints,
}: EnrollmentTrendMetricProps) {
  const hasData = enrollmentTrendPoints.some((p) => p.value > 0);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">
          New Enrollments Over Time
        </p>
        <p className="text-xs text-slate-500">
          Learners enrolling in your courses
        </p>
      </div>
      {!hasData ? (
        <EmptyMetricState message="Enrollment trends appear once learners start enrolling in your courses." />
      ) : (
        <BarMetricChart points={enrollmentTrendPoints} />
      )}
    </>
  );
}
