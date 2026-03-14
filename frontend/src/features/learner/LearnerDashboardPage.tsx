import { Button } from '@/components/ui/button';
import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { PersonalAnalytics } from './dashboard/PersonalAnalytics';
import { PublishedCoursesCard } from './dashboard/PublishedCoursesCard';
import { TopTrendsTable } from './dashboard/TopTrendsTable';
import { TrendCourseSearchDialog } from './dashboard/TrendCourseSearchDialog';

export default function LearnerDashboardPage() {
  const { user } = useAuth();
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(58);
  const [isResizing, setIsResizing] = useState(false);
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendSearch, setTrendSearch] = useState('');

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (event: MouseEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(65, Math.max(45, pct));
      setLeftPaneWidth(clamped);
    };

    const onMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="w-full bg-slate-50 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
                Learner Dashboard
              </div>
              <Heading1 className="mt-3 text-slate-900">
                Welcome back, {user?.username}.
              </Heading1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                Monitor key trend shifts and move quickly on what matters this
                week.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-lg px-5" asChild>
                  <Link to="/learner/discover">Explore topics</Link>
                </Button>
              </div>
            </div>

            <PublishedCoursesCard />
          </div>
        </section>

        <div
          ref={splitContainerRef}
          className="flex flex-col gap-5 lg:flex-row lg:gap-0"
          style={{ '--left-pane': `${leftPaneWidth}%` } as CSSProperties}
        >
          <section className="min-w-0 basis-full rounded-2xl border border-slate-200 bg-white p-5 md:p-6 lg:[flex-basis:var(--left-pane)]">
            <TopTrendsTable
              onTrendClick={(trendName) => {
                setTrendSearch(trendName);
                setIsTrendModalOpen(true);
              }}
            />
          </section>

          <div className="hidden lg:flex lg:w-5 lg:items-center lg:justify-center">
            <button
              type="button"
              aria-label="Resize dashboard panels"
              className="h-20 w-1.5 cursor-col-resize rounded-full bg-slate-300 transition-colors hover:bg-slate-400"
              onMouseDown={(event) => {
                event.preventDefault();
                setIsResizing(true);
              }}
            />
          </div>

          <PersonalAnalytics />
        </div>

        <TrendCourseSearchDialog
          initialSearchValue={trendSearch}
          open={isTrendModalOpen}
          onOpenChange={setIsTrendModalOpen}
        />
      </div>
    </div>
  );
}
