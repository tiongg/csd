import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

export default function LearnerDashboardPage() {
  const { user } = useAuth();
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(58);
  const [isResizing, setIsResizing] = useState(false);
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendSearch, setTrendSearch] = useState('');

  const { data: courses } = useApiQuery('get', '/api/courses/published');
  const publishedCourses = courses ?? [];
  const filteredCourses = publishedCourses.filter((course) =>
    course.title.toLowerCase().includes(trendSearch.toLowerCase()),
  );

  const { data: trendData } = useQuery({
    queryKey: ['learnerDashboardTrends'],
    queryFn: async () => {
      const response = await fetch('/2026-02-20_130221_gen_alpha_trends.json');
      const data = await response.json();
      return {
        trends: data.trends as Array<{
          rank: number;
          name: string;
          metric: string;
        }>,
        generatedAtUtc: data.metadata?.generated_at_utc as string | undefined,
      };
    },
  });
  const topTrends = (trendData?.trends ?? []).slice(0, 5);
  const weeklyCadence = [1, 0, 1, 1, 0, 1, 0];
  const activeDays = weeklyCadence.reduce((sum, day) => sum + day, 0);
  const focusScore = Math.round((activeDays / 7) * 100);

  function cleanText(text: string) {
    return text
      .replaceAll('â€‘', '-')
      .replaceAll('â€™', "'")
      .replaceAll('â€œ', '"')
      .replaceAll('â€\u009d', '"')
      .replaceAll('â€“', '-');
  }

  type TrendMovement = 'Rising' | 'Falling' | 'New';
  function getMovement(
    trend: { rank: number; name: string; metric: string },
    index: number,
  ): TrendMovement {
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

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
              <p className="text-sm font-semibold text-slate-700">Now Available</p>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                {publishedCourses.length > 0 ? (
                  <ul className="space-y-3">
                    {publishedCourses.slice(0, 3).map((course) => (
                      <li
                        key={course.id}
                        className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {course.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            Updated {dayjs(course.updatedAt).fromNow()}
                          </p>
                        </div>
                        <span className="text-slate-400">↗</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600">No published courses yet.</p>
                )}
                <Button className="mt-4 rounded-lg" variant="outline" asChild>
                  <Link to="/learner/my-courses">Go to my courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div
          ref={splitContainerRef}
          className="flex flex-col gap-5 lg:flex-row lg:gap-0"
          style={{ '--left-pane': `${leftPaneWidth}%` } as CSSProperties}
        >
          <section className="basis-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 lg:[flex-basis:var(--left-pane)]">
            <h2 className="text-xl font-semibold text-slate-900">Top Trends</h2>
            <p className="mt-1 text-sm text-slate-600">Top 5 today.</p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Rank</th>
                    <th className="px-4 py-3 font-semibold">Trend</th>
                    <th className="px-4 py-3 font-semibold">Movement</th>
                  </tr>
                </thead>
                <tbody>
                  {topTrends.map((trend, index) => {
                    const movement = getMovement(trend, index);
                    return (
                      <tr
                        key={trend.rank}
                        className="cursor-pointer border-t border-slate-200 text-slate-800 hover:bg-slate-50"
                        onClick={() => {
                          setTrendSearch(cleanText(trend.name));
                          setIsTrendModalOpen(true);
                        }}
                      >
                        <td className="px-4 py-3 font-semibold">#{trend.rank}</td>
                        <td className="px-4 py-3 font-medium">
                          {cleanText(trend.name)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${movementClass(movement)}`}
                          >
                            <MovementIcon movement={movement} />
                            {movement}
                          </span>
                        </td>
                      </tr>
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

          <section className="basis-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 lg:flex-1">
            <h2 className="text-xl font-semibold text-slate-900">Personal Analytics</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your learning activity and momentum.
            </p>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Learning cadence (7 days)</p>
              <div className="mt-3 flex h-24 items-end gap-1.5">
                {weeklyCadence.map((day, idx) => (
                  <div key={idx} className="flex flex-1 flex-col items-center justify-end">
                    <div
                      className={`w-full rounded-t ${
                        day ? 'bg-sky-500' : 'bg-slate-300'
                      }`}
                      style={{ height: day ? '70px' : '24px' }}
                    />
                    <span className="mt-1 text-[10px] text-slate-500">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Progress metrics</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-slate-200 bg-white p-2">
                  <p className="text-[11px] text-slate-500">Active days</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeDays}/7
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-2">
                  <p className="text-[11px] text-slate-500">Current streak</p>
                  <p className="text-sm font-semibold text-slate-900">4 days</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-2">
                  <p className="text-[11px] text-slate-500">Focus score</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {focusScore}%
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-2">
                  <p className="text-[11px] text-slate-500">Courses open</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {publishedCourses.length}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <Dialog open={isTrendModalOpen} onOpenChange={setIsTrendModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Trend to Course Match</DialogTitle>
              <DialogDescription>
                Search courses using this trend keyword.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                value={trendSearch}
                onChange={(e) => setTrendSearch(e.target.value)}
                placeholder="Search trend keyword"
                className="h-11"
              />

              {filteredCourses.length > 0 ? (
                <div className="max-h-80 space-y-2 overflow-auto">
                  {filteredCourses.slice(0, 8).map((course) => (
                    <Link
                      key={course.id}
                      to="/learner/courses/$courseId"
                      params={{ courseId: course.id }}
                      onClick={() => setIsTrendModalOpen(false)}
                      className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {course.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Updated {dayjs(course.updatedAt).fromNow()}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  No matching course found for this trend yet.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
