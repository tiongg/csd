import { useApiQuery } from '@/lib/fetch-client';

export function PersonalAnalytics() {
  const { data: analytics } = useApiQuery('get', '/api/learner/analytics');

  if (!analytics) {
    return (
      <section className="min-w-0 basis-full rounded-2xl border border-slate-200 bg-white p-5 md:p-6 lg:flex-1">
        <h2 className="text-xl font-semibold text-slate-900">
          Personal Analytics
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Your learning activity and momentum.
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Loading analytics...</p>
        </div>
      </section>
    );
  }

  const { activeDays, weeklyCadence, focusScore, completedCoursesCount, currentStreak } =
    analytics;

  return (
    <section className="min-w-0 basis-full rounded-2xl border border-slate-200 bg-white p-5 md:p-6 lg:flex-1">
      <h2 className="text-xl font-semibold text-slate-900">
        Personal Analytics
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Your learning activity and momentum.
      </p>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Learning cadence (7 days)</p>
        <div className="mt-3 flex h-24 items-end gap-1.5">
          {weeklyCadence.map((day, idx) => (
            <div
              key={idx}
              className="flex flex-1 flex-col items-center justify-end"
            >
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
            <p className="text-sm font-semibold text-slate-900">{currentStreak} days</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-2">
            <p className="text-[11px] text-slate-500">Focus score</p>
            <p className="text-sm font-semibold text-slate-900">
              {focusScore}%
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-2">
            <p className="text-[11px] text-slate-500">Completed courses</p>
            <p className="text-sm font-semibold text-slate-900">
              {completedCoursesCount} courses
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
