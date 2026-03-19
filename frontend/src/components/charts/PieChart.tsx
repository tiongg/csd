import { cn } from '@/lib/utils';

export type PieData = {
  label: string;
  value: number;
  color?: string;
};

type PieChartProps = {
  data: PieData[];
  title?: string;
  className?: string;
  showLegend?: boolean;
  size?: number;
};

export default function PieChart({
  data,
  title,
  className,
  showLegend = true,
}: PieChartProps) {
  const defaultColors = [
    '#0284c7',
    '#38bdf8',
    '#7dd3fc',
    '#bae6fd',
    '#e0f2fe',
    '#0369a1',
    '#0ea5e9',
    '#22d3ee',
    '#67e8f9',
    '#a5f3fc',
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = 50;
  const centerY = 50;
  const radius = 35;

  let currentAngle = 0;

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;

    return {
      path: pathData,
      color: item.color || defaultColors[index % defaultColors.length],
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1),
    };
  });

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {title && <p className="text-sm font-semibold text-slate-700">{title}</p>}
      <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <svg
          viewBox="0 0 100 100"
          className="h-32 w-32 flex-shrink-0"
          preserveAspectRatio="xMidYMid meet"
        >
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="#ffffff"
              strokeWidth="1"
              className="transition-opacity hover:opacity-80"
            />
          ))}
        </svg>

        {showLegend && (
          <div className="flex flex-col gap-1.5 overflow-x-auto">
            {slices.map((slice, index) => (
              <div
                key={index}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-600">{slice.label}</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {slice.value} ({slice.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
