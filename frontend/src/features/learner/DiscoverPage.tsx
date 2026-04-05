import SearchBar from '@/components/ui/searchbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading1 } from '@/components/ui/typography';
import { useApiQuery } from '@/lib/fetch-client';
import { useMemo, useState } from 'react';
import { CourseCard } from './course-card/CourseCard';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const {
    data: courses,
    isLoading,
    isError,
  } = useApiQuery('get', '/api/courses/published', {});

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      (courses ?? []).map(({ course }) => course.category),
    );
    return Array.from(uniqueCategories).sort();
  }, [courses]);

  const filteredCourses = useMemo(
    () =>
      (courses ?? []).filter(({ course }) => {
        const matchesSearch = course.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'all' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [courses, searchQuery, selectedCategory],
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-5">
        <section className={glassPanelClass}>
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
            Discover
          </div>
          <Heading1 className="mt-3 text-slate-900">Explore Courses</Heading1>
          <p className="mt-2 text-sm text-slate-600">
            Browse all existing published courses.
          </p>
        </section>

        <section className={`${glassPanelClass} flex flex-1 flex-col`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory !== 'all' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Filtered by:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-200"
                  >
                    {selectedCategory}
                    <span className="ml-1">×</span>
                  </button>
                </div>
              )}
            </div>
            <div className="w-full sm:w-72">
              <SearchBar
                placeholder="Search courses"
                onSearch={setSearchQuery}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="animate-pulse text-sm">Loading courses...</p>
            </div>
          ) : isError ? (
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="text-sm">
                Failed to load courses. Please try again later.
              </p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="text-lg font-semibold">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredCourses.map(({ course }) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  variant="discover"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
