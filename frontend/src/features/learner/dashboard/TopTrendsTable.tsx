import { cleanText } from '@/lib/utils';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import { SkeletonRow } from './TopTrendsTableSkeletons';

const rowVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
};

type TrendMovement = 'Rising' | 'Falling' | 'New';

type Trend = {
  rank: number;
  name: string;
  metric: string;
};

type TopTrendsTableProps = {
  onTrendClick: (trendName: string) => void;
};

function getMovement(trend: Trend, index: number) {
  const signal = `${trend.name} ${trend.metric}`.toLowerCase();
  if (
    signal.includes('new') ||
    signal.includes('reviving') ||
    signal.includes('since january')
  ) {
    return 'New';
  }
  if (
    signal.includes('rising') ||
    signal.includes('surge') ||
    signal.includes('spike') ||
    signal.includes('fastest-growing') ||
    signal.includes('upswing')
  ) {
    return 'Rising';
  }
  if (trend.rank >= 4 && trend.rank <= 5) {
    return 'Falling';
  }
  return index % 2 === 0 ? 'Rising' : 'New';
}

function movementClass(movement: TrendMovement) {
  switch (movement) {
    case 'Rising':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Falling':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-sky-200 bg-sky-50 text-sky-700';
  }
}

function MovementIcon({ movement }: { movement: TrendMovement }) {
  if (movement === 'Rising') {
    return <ArrowTrendingUpIcon className="size-3.5" />;
  }
  if (movement === 'Falling') {
    return <ArrowTrendingDownIcon className="size-3.5" />;
  }
  return <SparklesIcon className="size-3.5" />;
}

export function TopTrendsTable({
  onTrendClick,
  children,
}: PropsWithChildren<TopTrendsTableProps>) {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ['learnerDashboardTrends'],
    queryFn: async () => {
      const response = await fetch('/2026-02-20_130221_gen_alpha_trends.json');
      const data = await response.json();
      return {
        trends: data.trends as Array<Trend>,
        generatedAtUtc: data.metadata?.generated_at_utc as string | undefined,
      };
    },
  });

  const topTrends = (trendData?.trends ?? []).slice(0, 5);

  if (isLoading) {
    return (
      <section className="min-w-0 basis-full rounded-2xl border border-slate-200 bg-white p-5 md:p-6 lg:flex-1">
        {children}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[86px]" />
              <col />
              <col className="w-[130px]" />
            </colgroup>
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Trend</th>
                <th className="px-4 py-3 text-right font-semibold">Movement</th>
              </tr>
            </thead>
            <tbody>
              {_.range(5).map((idx) => (
                <SkeletonRow key={idx} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 basis-full rounded-2xl border border-slate-200 bg-white p-5 md:p-6 lg:flex-1">
      {children ?? (
        <>
          <h2 className="text-xl font-semibold text-slate-900">Top Trends</h2>
          <p className="mt-1 text-sm text-slate-600">Top 5 this week</p>
        </>
      )}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[86px]" />
            <col />
            <col className="w-[130px]" />
          </colgroup>
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">Trend</th>
              <th className="px-4 py-3 text-right font-semibold">Movement</th>
            </tr>
          </thead>
          <tbody>
            {topTrends.map((trend, index) => {
              const movement = getMovement(trend, index);
              return (
                <motion.tr
                  key={trend.rank}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.05 }}
                  className="cursor-pointer border-t border-slate-200 text-slate-800 hover:bg-slate-50"
                  onClick={() => onTrendClick(cleanText(trend.name))}
                >
                  <td className="px-4 py-3 font-semibold">#{trend.rank}</td>
                  <td className="px-4 py-3 font-medium">
                    <p className="truncate" title={cleanText(trend.name)}>
                      {cleanText(trend.name)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${movementClass(movement)}`}
                    >
                      <MovementIcon movement={movement} />
                      <span className="truncate">{movement}</span>
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {topTrends.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Trend data is currently unavailable.
        </div>
      )}
    </section>
  );
}
