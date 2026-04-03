import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import ContributorAnalytics from '@/features/contributor/ContributorAnalytics';
import { ContributorReviewQueue } from '@/features/contributor/ContributorReviewQueue';
import { useResizableSplit } from '@/features/dashboard/useResizableSplit';
import { TopTrendsTable } from '../learner/dashboard/TopTrendsTable';

export default function ContributorDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.realname?.trim() || user?.username;
  const { splitContainerRef, splitStyle, startResizing } = useResizableSplit();

  return (
    <div className="w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-8">
          <div className="grid gap-5">
            <div>
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
                Contributor Dashboard
              </div>
              <Heading1 className="mt-3 text-slate-900">
                Welcome back, {displayName}.
              </Heading1>
              <p className="mt-2 max-w-4xl text-base leading-relaxed text-slate-600">
                Manage review pipelines, prioritize pending courses, and convert
                trend signals into publish-ready modules.
              </p>
            </div>
          </div>
        </section>

        <ContributorAnalytics />

        <div
          ref={splitContainerRef}
          className="flex flex-col gap-5 lg:flex-row lg:gap-0"
          style={splitStyle}
        >
          <ContributorReviewQueue />

          <div className="hidden lg:flex lg:w-5 lg:items-center lg:justify-center">
            <button
              type="button"
              aria-label="Resize review queue and trends panels"
              className="h-20 w-1.5 cursor-col-resize rounded-full bg-slate-300 transition-colors hover:bg-slate-400"
              onMouseDown={startResizing}
            />
          </div>

          <TopTrendsTable
            title="Today's Top Trends"
            description="Top 5 signals to monitor."
          />
        </div>
      </div>
    </div>
  );
}
