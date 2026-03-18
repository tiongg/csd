import { cn } from '@/lib/utils';

export interface StackedBarData {
  label: string;
  stacks: { name: string; value: number; color?: string }[];
}

interface StackedBarChartProps {
  data: StackedBarData[];
  title?: string;
  className?: string;
  height?: number;
}

export default function StackedBarChart({
  data,
  title,
  className,
  height = 200,
}: StackedBarChartProps) {
  const chartWidth = 100;
  const chartHeight = height;
  const chartPadding = 10;
  const barWidth = Math.max(4, (chartWidth - chartPadding * 2) / data.length - 2);

  const allStackNames = Array.from(
    new Set(data.flatMap((d) => d.stacks.map((s) => s.name)))
  );

  const stackColors: Record<string, string> = {
    'Video Watched': '#0284c7',
    'Lessons Completed': '#38bdf8',
    'Quizzes Taken': '#7dd3fc',
    default: '#0ea5e9',
  };

  const maxValue = Math.max(
    ...data.map((d) => d.stacks.reduce((sum, s) => sum + s.value, 0)),
    1
  );

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

          {/* Stacked bars */}
          {data.map((barData, index) => {
            const x =
              chartPadding +
              index * ((chartWidth - chartPadding * 2) / data.length) +
              ((chartWidth - chartPadding * 2) / data.length - barWidth) / 2;

            let currentY = chartHeight - chartPadding;

            return (
              <g key={index}>
                {barData.stacks.map((stack, stackIndex) => {
                  const stackHeight =
                    (stack.value / maxValue) *
                    (chartHeight - chartPadding * 2);
                  const y = currentY - stackHeight;

                  const stackY = y;

                  currentY = y;

                  return (
                    <rect
                      key={`${index}-${stackIndex}`}
                      x={x}
                      y={stackY}
                      width={barWidth}
                      height={stackHeight}
                      fill={
                        stack.color ||
                        stackColors[stack.name] ||
                        stackColors.default
                      }
                      rx="0.5"
                    />
                  );
                })}

                {/* Bar label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 2}
                  textAnchor="middle"
                  className="text-[1.5px] fill-slate-500"
                  fontSize="1.5"
                >
                  {barData.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2">
        {allStackNames.map((name) => (
          <div key={name} className="flex items-center gap-1">
            <div
              className="h-2 w-2 flex-shrink-0 rounded-sm"
              style={{
                backgroundColor: stackColors[name] || stackColors.default,
              }}
            />
            <span className="text-xs text-slate-600">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
