import { cn } from '@/lib/utils';

export interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  title?: string;
  className?: string;
  showLabels?: boolean;
  height?: number;
}

export default function BarChart({
  data,
  title,
  className,
  showLabels = true,
  height = 200,
}: BarChartProps) {
  const chartHeight = height;
  const chartWidth = 100;
  const chartPadding = 10;
  const barWidth = Math.max(2, (chartWidth - chartPadding * 2) / data.length - 1);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const defaultColors = [
    '#0284c7', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe',
    '#0369a1', '#0ea5e9', '#22d3ee', '#67e8f9', '#a5f3fc',
  ];

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {title && <p className="text-sm font-semibold text-slate-700">{title}</p>}
      <div
        className="w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3"
        style={{ height: `${chartHeight + 50}px` }}
      >
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => {
            const y =
              chartPadding +
              (i * (chartHeight - chartPadding * 2)) / 3;
            return (
              <line
                key={i}
                x1={chartPadding}
                x2={chartWidth - chartPadding}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="1 2"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = Math.max(
              2,
              ((item.value / maxValue) * (chartHeight - chartPadding * 2))
            );
            const x =
              chartPadding +
              index * ((chartWidth - chartPadding * 2) / data.length) +
              ((chartWidth - chartPadding * 2) / data.length - barWidth) / 2;
            const y = chartHeight - chartPadding - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || defaultColors[index % defaultColors.length]}
                  rx="0.5"
                />
                {showLabels && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 1}
                    textAnchor="middle"
                    className="text-[2px] fill-slate-600 font-medium"
                    fontSize="2"
                  >
                    {item.value}
                  </text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 2}
                  textAnchor="middle"
                  className="text-[1.5px] fill-slate-500"
                  fontSize="1.5"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
