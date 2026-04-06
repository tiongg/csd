import { cleanText, cn } from '@/lib/utils';
import { useApiQuery } from '@/lib/fetch-client';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
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

type TopTag = {
  id: string;
  title: string;
  usageCount: number;
};

type TopTrendsTableProps = PropsWithChildren<{
  onTrendClick?: (tagName: string) => void;
  title?: string;
  description?: string;
}>;

function getMovement(tag: TopTag, index: number) {
  // For tags, we'll use a simple heuristic based on rank position
  // Higher rank (lower number) = rising, lower rank = falling/new
  if (index === 0) return 'Rising';
  if (tag.usageCount > 10) return 'Rising';
  if (tag.usageCount < 5) return 'New';
  return index % 2 === 0 ? 'Rising' : 'Falling';
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
  title = 'Top Trends',
  description = 'Top 5 this week',
  children,
}: TopTrendsTableProps) {
  const { data: topTags, isLoading } = useApiQuery(
    'get',
    '/api/tags/top',
    {},
  );

  const displayData = (topTags ?? []).map((tag, index) => ({
    rank: index + 1,
    name: tag.title,
    metric: `${tag.usageCount} courses`,
    originalTag: tag,
  }));

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
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
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
            {displayData.map((item, index) => {
              const movement = getMovement(item.originalTag, index);
              return (
                <motion.tr
                  key={item.rank}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'border-t border-slate-200 text-slate-800',
                    onTrendClick && 'cursor-pointer hover:bg-slate-50',
                  )}
                  onClick={
                    onTrendClick
                      ? () => onTrendClick(cleanText(item.name))
                      : undefined
                  }
                >
                  <td className="px-4 py-3 font-semibold">#{item.rank}</td>
                  <td className="px-4 py-3 font-medium">
                    <p className="truncate" title={cleanText(item.name)}>
                      {cleanText(item.name)}
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
      {displayData.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Trend data is currently unavailable.
        </div>
      )}
    </section>
  );
}
