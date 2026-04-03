import { Heading1 } from '@/components/ui/typography';
import { useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import SearchBar from '@/components/ui/searchbar';
import { AllPublishedCourses } from './course-moderation/AllPublishedCourses';
import { CoursePendingApprovals } from './course-moderation/CoursePendingApprovals';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

export default function CourseModerationForm() {
  const [activeTab, setActiveTab] = useState<'pending' | 'courses'>('pending');
  const [allCoursesSearchQuery, setAllCoursesSearchQuery] = useState('');
  const { data: pendingCourses } = useApiQuery(
    'get',
    '/api/content-versions/pending',
  );
  const tabTrackRef = useRef<HTMLDivElement | null>(null);
  const [tabPill, setTabPill] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const updateTabPill = () => {
      const track = tabTrackRef.current;
      if (!track) return;

      const activeButton = track.querySelector(
        '[data-course-tab-active="true"]',
      ) as HTMLElement | null;

      if (!activeButton) {
        setTabPill((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const trackRect = track.getBoundingClientRect();
      const activeRect = activeButton.getBoundingClientRect();

      setTabPill({
        left: activeRect.left - trackRect.left,
        width: activeRect.width,
        opacity: 1,
      });
    };

    updateTabPill();
    window.addEventListener('resize', updateTabPill);
    return () => window.removeEventListener('resize', updateTabPill);
  }, [activeTab]);

  const pendingCount = pendingCourses?.length ?? 0;
  const pendingCountLabel =
    pendingCourses == null
      ? 'Loading pending courses...'
      : pendingCount === 1
        ? '1 pending course'
        : `${pendingCount} pending courses`;

  return (
    <div className="flex min-h-0 w-full flex-1 bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-5">
        <section className={glassPanelClass}>
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
            Admin Console
          </div>
          <Heading1 className="mt-3 text-slate-900">Course Moderation</Heading1>
          <p className="mt-2 text-sm text-slate-600">
            Review submissions and keep course quality consistent before
            publish.
          </p>
        </section>

        <section className={cn(glassPanelClass, 'min-h-0 flex-1')}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-lg border border-slate-300/80 bg-white/65 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_20px_-16px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div
                ref={tabTrackRef}
                className="relative inline-flex rounded-md border border-transparent bg-white/30 p-1 shadow-none backdrop-blur-xl"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1 bottom-1 rounded-md border border-stone-400/45 bg-gradient-to-b from-white/92 via-slate-100/75 to-stone-200/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.38),0_10px_24px_-12px_rgba(51,65,85,0.42)] backdrop-blur-2xl transition-[left,width,opacity] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    width: `${tabPill.width}px`,
                    opacity: tabPill.opacity,
                    left: `${tabPill.left}px`,
                  }}
                />
                {(['pending', 'courses'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    data-course-tab-active={activeTab === tab}
                    className={cn(
                      'relative z-10 rounded-md border border-transparent px-3 py-1.5 text-sm font-semibold transition-colors duration-240',
                      activeTab === tab
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-800',
                    )}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'pending' ? 'Pending Approvals' : 'All Courses'}
                  </button>
                ))}
              </div>
            </div>
            {activeTab === 'courses' && (
              <div className="w-full sm:w-80">
                <SearchBar
                  placeholder="Search courses by title, description, or tag"
                  className="h-9 rounded-lg border-slate-300 bg-white/85"
                  onSearch={setAllCoursesSearchQuery}
                />
              </div>
            )}
            {activeTab === 'pending' && (
              <p className="text-sm font-medium text-slate-600">
                {pendingCountLabel}
              </p>
            )}
          </div>

          <div className="pt-4">
            {activeTab === 'pending' ? (
              <CoursePendingApprovals />
            ) : (
              <AllPublishedCourses searchQuery={allCoursesSearchQuery} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
