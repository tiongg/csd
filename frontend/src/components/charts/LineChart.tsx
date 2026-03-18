import { cn } from '@/lib/utils';

export interface LineData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineData[];
  title?: string;
  className?: string;
  showArea?: boolean;
  height?: number;
  color?: string;
}

export default function LineChart({
  data,
  title,
  className,
  showArea = true,
  height = 200,
  color = '#0284c7',
}: LineChartProps) {
  const chartWidth = 100;
  const chartHeight = height;
  const chartPadding = 10;
  const chartMin = Math.min(...data.map((d) => d.value));
  const chartMax = Math.max(...data.map((d) => d.value));
  const chartRange = Math.max(1, chartMax - chartMin);

  const chartPoints = data.map((item, index) => {
    const x =
      chartPadding +
      (index * (chartWidth - chartPadding * 2)) / (data.length - 1);
    const y =
      chartHeight -
      chartPadding -
      ((item.value - chartMin) / chartRange) * (chartHeight - chartPadding * 2);
    return { x, y, value: item.value, label: item.label };
  });

  const chartLinePoints = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${chartPoints[0]!.x} ${chartHeight - chartPadding} L ${chartLinePoints.replaceAll(' ', ' L ')} L ${chartPoints[chartPoints.length - 1]!.x} ${chartHeight - chartPadding} Z`;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {title && <p className="text-sm font-semibold text-slate-700">{title}</p>}
      <div
        className="w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3"
        style={{ height: `${chartHeight + 40}px` }}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => {
            const y =
              chartPadding + (i * (chartHeight - chartPadding * 2)) / 3;
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

          {/* Area fill */}
          {showArea && <path d={areaPath} fill="url(#trendFill)" />}

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={chartLinePoints}
          />

          {/* Data points */}
          {chartPoints.map((point) => (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#ffffff"
              stroke={color}
              strokeWidth="1"
            />
          ))}

          {/* X-axis labels */}
          {chartPoints.map((point, index) => (
            <text
              key={`label-${index}`}
              x={point.x}
              y={chartHeight - 2}
              textAnchor="middle"
              className="text-[1.5px] fill-slate-500"
              fontSize="1.5"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
