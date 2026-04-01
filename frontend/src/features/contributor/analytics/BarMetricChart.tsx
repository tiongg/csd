import type { BarMetricPoint } from '../contributor-utils';

type BarMetricChartProps = {
  points: BarMetricPoint[];
};

export function BarMetricChart({ points }: BarMetricChartProps) {
  const maxValue = Math.max(1, ...points.map((point) => point.value));

  return (
    <div className="mt-4 flex h-[240px] items-end gap-2 rounded-md border border-slate-200/80 bg-slate-50/70 p-3 backdrop-blur-sm">
      {points.map((point) => {
        const height = 22 + Math.round((point.value / maxValue) * 120);
        return (
          <div
            key={point.label}
            className="flex flex-1 flex-col items-center justify-end"
          >
            <div
              className="w-full rounded-t bg-sky-500 transition-all"
              style={{ height: `${height}px` }}
              title={point.title}
            />
            <span className="mt-2 text-[10px] text-slate-500">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
