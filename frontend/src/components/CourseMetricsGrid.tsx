import {
  Card,
  CardContent,
} from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export type CourseMetric = {
  label: string;
  value: number;
  icon: LucideIcon;
};

type CourseMetricsGridProps = {
  metrics: CourseMetric[];
};

export default function CourseMetricsGrid({
  metrics,
}: CourseMetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="border-slate-200/90 bg-white/90 py-0 shadow-sm"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100/80">
                <metric.icon className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{metric.label}</p>
                <p className="text-2xl font-semibold leading-none">
                  {metric.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
