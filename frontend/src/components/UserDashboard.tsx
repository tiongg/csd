import useActiveRole from '@/hooks/useActiveRole';
import { useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { match } from 'ts-pattern';
import TrendsPage from './TrendsPage';
import { Heading1 } from './ui/typography';

/**
 * ROOT CAUSES FIXED HERE:
 *
 * Bug 2 — "Total Courses" counts pending courses too:
 *   Old: `totalCourses = allCourses?.length`  ← counts ALL regardless of status
 *   Fix: filter to `isPublished === true` before taking .length
 *
 * Bug 4 — Contributor "Awaiting Approvals" always 0:
 *   Old: used `pendingContributors` (from /api/admins/contributor-applications)
 *        for BOTH the ADMIN and CONTRIBUTOR cards.
 *        Contributors get 403 on that endpoint → query returns undefined → 0.
 *   Fix: - ADMIN card: still uses /api/admins/contributor-applications (correct)
 *          but query is disabled unless role === 'ADMIN' to avoid 403 noise.
 *        - CONTRIBUTOR card: counts allCourses where isPublished === false —
 *          these are the contributor's own courses pending admin approval.
 *          No extra request needed; allCourses is already fetched.
 */
function CardsByRole() {
  const dir = useActiveRole() ?? 'LEARNER';

  const { data: allUsers } = useApiQuery('get', '/api/account/', {});
  const { data: allCourses } = useApiQuery('get', '/api/courses/', {});

  // Only fetch admin-only endpoint when the user is actually an admin
  const { data: pendingContributors } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {},
    { enabled: dir === 'ADMIN' },
  );

  const totalLearners = (allUsers ?? []).filter(
    (u) => u.role === 'LEARNER',
  ).length;

  // ✅ Bug 2: published only
  const totalPublishedCourses = (allCourses ?? []).filter(
    (c) => c.isPublished,
  ).length;

  // ADMIN metric: contributor applications awaiting approval
  const pendingContributorApps = pendingContributors?.length ?? 0;

  // ✅ Bug 4: CONTRIBUTOR metric — their own courses not yet approved
  const contributorAwaitingApproval = (allCourses ?? []).filter(
    (c) => !c.isPublished,
  ).length;

  console.debug('[Dashboard] role:', dir);
  console.debug('[Dashboard] totalPublishedCourses:', totalPublishedCourses);
  console.debug('[Dashboard] totalLearners:', totalLearners);
  console.debug('[Dashboard] pendingContributorApps:', pendingContributorApps);
  console.debug('[Dashboard] contributorAwaitingApproval:', contributorAwaitingApproval);

  return match(dir)
    .with('ADMIN', () => (
      <>
        <InfoCard
          title="Pending Approvals"
          value={pendingContributorApps.toString()}
          variant={pendingContributorApps > 0 ? 'danger' : 'default'}
        />
        <InfoCard
          title="Total Learners"
          value={totalLearners.toString()}
          variant="default"
        />
        <InfoCard
          title="Published Courses"
          value={totalPublishedCourses.toString()}
          variant="default"
        />
      </>
    ))
    .with('CONTRIBUTOR', () => (
      <>
        {/* ✅ Bug 4: contributor's own pending courses, not admin endpoint */}
        <InfoCard
          title="Awaiting Approvals"
          value={contributorAwaitingApproval.toString()}
          variant={contributorAwaitingApproval > 0 ? 'warning' : 'default'}
        />
        <InfoCard
          title="Total Learners"
          value={totalLearners.toString()}
          variant="default"
        />
        <InfoCard
          title="Published Courses"
          value={totalPublishedCourses.toString()}
          variant="default"
        />
      </>
    ))
    .with('LEARNER', () => (
      <>
        <InfoCard title="Daily Streak" value="4" variant="danger" />
        <InfoCard title="Current Rank" value="Top 10%" variant="default" />
        <InfoCard
          title="Total Courses"
          value={totalPublishedCourses.toString()}
          variant="default"
        />
      </>
    ))
    .exhaustive();
}

function ContentByRole() {
  const dir = useActiveRole() ?? 'LEARNER';
  return match(dir)
    .with('ADMIN', () => <AdminPlaceholder />)
    .with('CONTRIBUTOR', () => <TrendsPage />)
    .with('LEARNER', () => <TrendsPage />)
    .exhaustive();
}

function AdminPlaceholder() {
  return (
    <div className="flex h-120 w-full flex-col items-center justify-center rounded-xl border-2 border-slate-400 p-4 xl:px-8">
      <img
        src="/assets/admin.jpeg"
        className="h-full rounded-md"
        alt="placeholder admin image"
      />
      <div className="animate-pulse pt-4 text-slate-500 italic">
        More coming soon...
      </div>
    </div>
  );
}

type InfoCardProps = {
  title: string;
  value: string;
  variant: 'danger' | 'warning' | 'default';
};

function InfoCard({ title, value, variant }: InfoCardProps) {
  const STYLES = {
    danger:  'text-rose-400 border-rose-400',
    warning: 'text-amber-500 border-amber-500',
    default: 'text-slate-800 border-slate-400',
  };
  return (
    <div
      className={cn(
        'flex w-0 grow flex-col gap-4 rounded-lg border-2 p-8 text-center',
        STYLES[variant],
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