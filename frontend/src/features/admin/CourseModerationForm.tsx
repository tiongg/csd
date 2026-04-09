import { Heading1 } from '@/components/ui/typography';
import { apiQueryOptions, useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import SearchBar from '@/components/ui/searchbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AllPublishedCourses } from './course-moderation/AllPublishedCourses';
import { CoursePendingApprovals } from './course-moderation/CoursePendingApprovals';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';
const moderationSearchPlaceholder = 'Search title, creator, tags';

export default function CourseModerationForm() {
  const [activeTab, setActiveTab] = useState<'pending' | 'courses'>('pending');
  const [allCoursesSearchQuery, setAllCoursesSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('__all__');
  const [sortOption, setSortOption] = useState<
    'newest' | 'oldest' | 'title-asc' | 'title-desc'
  >('newest');
  const queryClient = useQueryClient();
  const { data: pendingCourses } = useApiQuery(
    'get',
    '/api/content-versions/pending',
  );
  const { data: publishedCourses } = useApiQuery('get', '/api/courses/published');
  const tabTrackRef = useRef<HTMLDivElement | null>(null);
  const [tabPill, setTabPill] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [tabPillReady, setTabPillReady] = useState(false);

  useLayoutEffect(() => {
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
      setTabPillReady(true);
    };

    updateTabPill();
    const rafId = window.requestAnimationFrame(updateTabPill);
    window.addEventListener('resize', updateTabPill);
    const resizeObserver = new ResizeObserver(updateTabPill);
    if (tabTrackRef.current) {
      resizeObserver.observe(tabTrackRef.current);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateTabPill);
      resizeObserver.disconnect();
    };
  }, [activeTab]);

  useEffect(() => {
    // Warm user-management data to avoid first-switch jitter between admin pages.
    void queryClient.prefetchQuery(
      apiQueryOptions('get', '/api/admins/contributor-applications'),
    );
    void queryClient.prefetchQuery(apiQueryOptions('get', '/api/account/', {}));
  }, [queryClient]);

  const pendingCount = pendingCourses?.length ?? 0;
  const allCoursesCount = publishedCourses?.length ?? 0;

  const pendingCountLabel = pendingCourses == null ? '...' : String(pendingCount);
  const allCoursesCountLabel =
    publishedCourses == null ? '...' : String(allCoursesCount);

  const categoryOptions = useMemo(() => {
    const sourceCategories =
      activeTab === 'pending'
        ? (pendingCourses ?? []).map(({ course }) => course.category)
        : (publishedCourses ?? []).map(({ course }) => course.category);

    return Array.from(new Set(sourceCategories))
      .filter((category): category is string => Boolean(category))
      .sort((a, b) => a.localeCompare(b));
  }, [activeTab, pendingCourses, publishedCourses]);

  return (
    <div className="flex">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-5">
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

        <section className={cn(glassPanelClass, 'min-h-0 flex flex-1 flex-col')}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-lg border border-slate-300/80 bg-white/65 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_20px_-16px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div
                ref={tabTrackRef}
                className="relative inline-flex rounded-md border border-transparent bg-white/30 p-1 shadow-none backdrop-blur-xl"
              >
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute top-1 bottom-1 rounded-md border border-stone-400/45 bg-gradient-to-b from-white/92 via-slate-100/75 to-stone-200/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.38),0_10px_24px_-12px_rgba(51,65,85,0.42)] backdrop-blur-2xl',
                    tabPillReady
                      ? 'transition-[left,width,opacity] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                      : 'transition-none',
                  )}
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
                      'relative z-10 cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm font-semibold transition-colors duration-240',
                      activeTab === tab
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-800',
                    )}
                    onClick={() => setActiveTab(tab)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>{tab === 'pending' ? 'Pending Approvals' : 'All Courses'}</span>
                      <span
                        className={cn(
                          'inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[11px] font-bold',
                          activeTab === tab
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-slate-300 bg-slate-100 text-slate-600',
                        )}
                      >
                        {tab === 'pending' ? pendingCountLabel : allCoursesCountLabel}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <div className="w-full sm:w-80">
                <SearchBar
                  placeholder={moderationSearchPlaceholder}
                  className="h-9 rounded-lg border-slate-300 bg-white/85"
                  onSearch={setAllCoursesSearchQuery}
                  value={allCoursesSearchQuery}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[190px] rounded-lg border-slate-300 bg-white/85">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="__all__">All categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortOption}
                onValueChange={(value) =>
                  setSortOption(
                    value as 'newest' | 'oldest' | 'title-asc' | 'title-desc',
                  )
                }
              >
                <SelectTrigger className="h-9 w-[150px] rounded-lg border-slate-300 bg-white/85">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="min-h-0 flex-1 pt-4">
            <div
              className={cn(
                activeTab === 'pending'
                  ? 'block h-full overflow-y-auto pt-1 pr-1'
                  : 'hidden',
              )}
            >
              <CoursePendingApprovals
                searchQuery={allCoursesSearchQuery}
                categoryFilter={categoryFilter}
                sortOption={sortOption}
              />
            </div>
            <div
              className={cn(
                activeTab === 'courses'
                  ? 'block h-full overflow-y-auto pt-1 pr-1'
                  : 'hidden',
              )}
            >
              <AllPublishedCourses
                searchQuery={allCoursesSearchQuery}
                categoryFilter={categoryFilter}
                sortOption={sortOption}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
