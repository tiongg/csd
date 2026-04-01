import type { EngagementSummary } from '../contributor-utils';

type EngagementFunnelProps = {
  engagementSummary: EngagementSummary;
};

export default function EngagementFunnel({
  engagementSummary,
}: EngagementFunnelProps) {
  return (
    <div className="mt-4 flex min-h-[240px] flex-col justify-between rounded-md border border-slate-200/80 bg-slate-50/70 p-4 backdrop-blur-sm">
      {engagementSummary.funnelRows.map((row) => {
        const width = Math.max(
          34,
          Math.round((row.value / engagementSummary.maxFunnelValue) * 100),
        );
        const share = Math.round(
          (row.value / engagementSummary.maxFunnelValue) * 100,
        );
        return (
          <div key={row.label}>
            <div
              className="mx-auto grid h-14 grid-cols-[1fr_auto_1fr] items-center rounded-md px-3 text-[11px] font-semibold text-white shadow-sm transition-all"
              style={{ width: `${width}%`, backgroundColor: row.color }}
            >
              <span className="min-w-0 truncate text-left">{row.label}</span>
              <span className="justify-self-center px-2 text-center">
                {row.value}
              </span>
              <span className="justify-self-end text-right">{share}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
