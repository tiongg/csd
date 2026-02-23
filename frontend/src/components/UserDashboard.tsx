import { match } from 'ts-pattern';
import { Heading1 } from './ui/typography';
import TrendsPage from './TrendsPage';
import useActiveRole from '@/hooks/useActiveRole';
import { cn } from '@/lib/utils';

function CardsByRole() {
  const dir = useActiveRole() ?? 'LEARNER';

  return match(dir)
    .with('ADMIN', () => (
      <>
        <InfoCard title="Pending Approvals" value="4" variant="danger" />
        <InfoCard title="Total Learners" value="10,000" variant="default" />
        <InfoCard title="Total Courses" value="1000" variant="default" />
      </>
    ))
    .with('CONTRIBUTOR', () => (
      <>
        <InfoCard title="Awaiting Approvals" value="4" variant="warning" />
        <InfoCard title="Total Learners" value="10,000" variant="default" />
        <InfoCard title="Total Courses" value="1000" variant="default" />
      </>
    ))
    .with('LEARNER', () => (
      <>
        <InfoCard title="Daily streak" value="4" variant="danger" />
        <InfoCard title="Current Rank" value="Top 10%" variant="default" />
        <InfoCard title="Total Courses" value="1000" variant="default" />
      </>
    ))
    .exhaustive();
}

function ContentByRole() {
  const dir = useActiveRole() ?? 'LEARNER';

  return match(dir)
    .with('ADMIN', () => <>admin placeholder</>)
    .with('CONTRIBUTOR', () => <TrendsPage/>)
    .with('LEARNER', () => <TrendsPage/>)
    .exhaustive();
}

type InfoCardProps = {
  title: string;
  value: string;
  variant: 'danger' | 'warning' | 'default';
};

function InfoCard({ title, value, variant }: InfoCardProps) {
  const INFO_CARD_STYLES = {
    danger: 'text-rose-400 border-rose-400',
    warning: 'text-amber-500 border-amber-500',
    default: 'text-slate-800 border-slate-400',
  };
  return (
    <div
      className={cn(
        'flex w-0 grow flex-col gap-4 rounded-lg border-2 p-8 text-center',
        INFO_CARD_STYLES[variant],
      )}
    >
      <div className="text-lg font-bold">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>Dashboard Overview</Heading1>
        <p className="font-subtitle">Here's what's happening today!</p>
      </div>

      <div className="flex justify-between gap-4">
        <CardsByRole />
      </div>

      <div className="flex h-full">
        <ContentByRole />
      </div>
    </div>
  );
}
