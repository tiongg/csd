import { cn } from '@/lib/utils';
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react';

type AnalyticsIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type AnalyticsMetricCard<TMetricKey extends string> = {
  key: TMetricKey;
  title: string;
  value: string;
  description: string;
  icon: AnalyticsIcon;
};

type DashboardAnalyticsSectionProps<
  TMetricKey extends string,
  TTimeframe extends string,
> = {
  title: string;
  description: string;
  timeframe: TTimeframe;
  timeframeOptions: readonly TTimeframe[];
  onTimeframeChange: (timeframe: TTimeframe) => void;
  metricCards: AnalyticsMetricCard<TMetricKey>[];
  selectedMetric: TMetricKey;
  onMetricSelect: (metricKey: TMetricKey) => void;
  children: ReactNode;
};

export function DashboardAnalyticsSection<
  TMetricKey extends string,
  TTimeframe extends string,
>({
  title,
  description,
  timeframe,
  timeframeOptions,
  onTimeframeChange,
  metricCards,
  selectedMetric,
  onMetricSelect,
  children,
}: DashboardAnalyticsSectionProps<TMetricKey, TTimeframe>) {
  const timeframeTrackRef = useRef<HTMLDivElement | null>(null);
  const [timeframePill, setTimeframePill] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const updateTimeframePill = () => {
      const track = timeframeTrackRef.current;
      if (!track) return;

      const activeButton = track.querySelector(
        '[data-timeframe-active="true"]',
      ) as HTMLElement | null;
      if (!activeButton) {
        setTimeframePill((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const trackRect = track.getBoundingClientRect();
      const activeRect = activeButton.getBoundingClientRect();
      setTimeframePill({
        left: activeRect.left - trackRect.left,
        width: activeRect.width,
        opacity: 1,
      });
    };

    updateTimeframePill();
    window.addEventListener('resize', updateTimeframePill);
    return () => window.removeEventListener('resize', updateTimeframePill);
  }, [timeframe, timeframeOptions]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <div className="rounded-lg border border-slate-300/80 bg-white/65 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_20px_-16px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div
            ref={timeframeTrackRef}
            className="relative inline-flex rounded-md border border-transparent bg-white/30 p-1 shadow-none backdrop-blur-xl"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-1 bottom-1 rounded-md border border-stone-400/45 bg-gradient-to-b from-white/92 via-slate-100/75 to-stone-200/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.38),0_10px_24px_-12px_rgba(51,65,85,0.42)] backdrop-blur-2xl transition-[left,width,opacity] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: `${timeframePill.width}px`,
                opacity: timeframePill.opacity,
                left: `${timeframePill.left}px`,
              }}
            />
            {timeframeOptions.map((windowValue) => (
              <button
                key={windowValue}
                type="button"
                data-timeframe-active={timeframe === windowValue}
                className={cn(
                  'relative z-10 rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold transition-colors duration-240',
                  timeframe === windowValue
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-800',
                )}
                onClick={() => onTimeframeChange(windowValue)}
              >
                {windowValue}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="grid grid-cols-1 gap-2">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            const selected = selectedMetric === metric.key;
            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => onMetricSelect(metric.key)}
                className={cn(
                  'flex w-full flex-col rounded-lg border px-4 py-3 text-left transition-colors',
                  selected
                    ? 'border-sky-300 bg-sky-50/75 shadow-sm'
                    : 'border-slate-300/85 bg-slate-100/70 hover:border-sky-200 hover:bg-sky-50/40',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                    {metric.title}
                  </p>
                  <Icon className="size-4 text-sky-600" />
                </div>
                <p className="mt-1 text-2xl font-semibold leading-tight text-slate-900">
                  {metric.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {metric.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex h-full flex-col rounded-lg border border-slate-300/85 bg-slate-100/70 p-4">
          {children}
        </div>
      </div>
    </section>
  );
}

type DashboardAnalyticsSkeletonProps = {
  title: string;
  description: string;
};

export function DashboardAnalyticsSkeleton({
  title,
  description,
}: DashboardAnalyticsSkeletonProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      <div className="mt-4 grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[98px] animate-pulse rounded-lg border border-slate-300/85 bg-slate-100/70 p-4"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-3 h-7 w-20 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-40 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-300/85 bg-slate-100/70 p-4">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-[220px] animate-pulse rounded-md bg-slate-200/70" />
        </div>
      </div>
    </section>
  );
}
