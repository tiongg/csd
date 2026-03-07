import {
  ChevronDownIcon,
  ChevronUpIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { P, match } from 'ts-pattern';
import { Heading3, Paragraph } from './ui/typography';

const CHANGE_ICON = {
  up: (
    <ChevronUpIcon className="size-5 text-emerald-400" aria-label="Up Arrow" />
  ),
  down: (
    <ChevronDownIcon className="size-5 text-rose-500" aria-label="Down Arrow" />
  ),
  none: <MinusIcon className="size-5 text-slate-600" aria-label="No Change" />,
} as const;

type TrendCardProps = {
  rank: number;
  change: keyof typeof CHANGE_ICON;
  trend: string;
};

function TrendCard({ rank, change, trend }: TrendCardProps) {
  return (
    <div className="flex w-full grow justify-between gap-x-2 rounded-xl border-2 border-slate-300 px-2 py-1 sm:px-4">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center">{CHANGE_ICON[change]}</div>
        <div>
          <Paragraph>{rank}</Paragraph>
        </div>
      </div>

      <div className="flex items-center">
        <Paragraph className="text-end text-sm xl:text-base">{trend}</Paragraph>
      </div>
    </div>
  );
}

function TrendsLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-2">
      <span className="box-border inline-block size-10 animate-spin rounded-full border-4 border-slate-300 border-b-sky-600"></span>
      <p className="animate-pulse text-slate-600 italic">
        Fetching the latest trends for you...
      </p>
    </div>
  );
}

function TrendsError() {
  return (
    <div className="flex h-full items-center justify-center">
      <p>We couldn't find any trends right now :( Check back later!</p>
    </div>
  );
}

function TrendsColumns({
  trendsData,
}: {
  trendsData: Array<{ rank: number; name: string }>;
}) {
  const rows = Math.ceil(trendsData.length / 2);
  return (
    <div
      className="grid h-full grid-flow-col grid-rows-5 gap-4"
      style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
    >
      {trendsData.map((trend, key) => (
        <TrendCard
          rank={trend.rank}
          change="down"
          trend={trend.name}
          key={key}
        />
      ))}
    </div>
  );
}

function TrendsDisplay({
  trendsData,
  loading,
}: {
  trendsData: Array<{ rank: number; name: string }>;
  loading: boolean;
}) {
  return match([loading, trendsData])
    .with([true, P.any], () => <TrendsLoading />)
    .with([false, P.intersection(P.not([]), P.not(undefined))], () => (
      <TrendsColumns trendsData={trendsData} />
    ))
    .otherwise(() => <TrendsError />);
}

export default function TrendsPage() {
  async function getTrendsData() {
    const response = await fetch('/2026-02-20_130221_gen_alpha_trends.json');
    const data = await response.json();
    return data.trends;
  }

  const { data: trendsData, isLoading: loading } = useQuery({
    queryKey: ['trendsData'],
    queryFn: getTrendsData,
  });

  return (
    <div className="flex h-full w-full flex-col rounded-xl border-2 border-slate-400 p-4 xl:px-8">
      <div>
        <Heading3>Top Trends</Heading3>
        <p className="font-subtitle">Keep up with the latest trends</p>
      </div>

      <TrendsDisplay trendsData={trendsData} loading={loading} />
    </div>
  );
}
