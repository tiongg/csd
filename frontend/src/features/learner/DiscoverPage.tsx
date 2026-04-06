import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import { useMemo, useState } from 'react';
import SearchBar from '@/components/ui/searchbar';
import { DiscoverCategoryCarousel } from './discover/DiscoverCategoryCarousel';
import { DiscoverFeaturedCarousel } from './discover/DiscoverFeaturedCarousel';
import { type DiscoverCourse } from './discover/types';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { preferences } = useAuth();
  const {
    data: courses,
    isLoading,
    isError,
  } = useApiQuery('get', '/api/courses/published', {});
  const { data: featuredCourses, isLoading: isLoadingFeatured } = useApiQuery(
    'get',
    '/api/courses/featured',
  );

  const normalizedPublishedCourses = useMemo<DiscoverCourse[]>(() => {
    return (courses ?? []).map(({ course }) => ({
      id: course.id,
      title: course.title,
      description: course.description ?? undefined,
      imageUrl: course.imageUrl ?? undefined,
      tags: course.tags ?? [],
      category: course.category,
      creatorLabel: course.creatorUsername ?? 'Course creator',
    }));
  }, [courses]);

  const normalizedFeaturedCourses = useMemo<DiscoverCourse[]>(() => {
    const categoryByCourseId = new Map(
      (courses ?? []).map(({ course }) => [course.id, course.category]),
    );

    return (featuredCourses ?? []).map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description ?? undefined,
      imageUrl: course.imageUrl ?? undefined,
      tags: course.tags ?? [],
      category: categoryByCourseId.get(course.id),
      creatorLabel: course.creatorUsername ?? 'Course creator',
    }));
  }, [featuredCourses, courses]);

  const filteredPublishedCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return normalizedPublishedCourses;
    }
    return normalizedPublishedCourses.filter((course) => {
      const matchesTitle = course.title.toLowerCase().includes(query);
      const matchesDescription = (course.description ?? '')
        .toLowerCase()
        .includes(query);
      const matchesCategory = (course.category ?? '').toLowerCase().includes(query);
      const matchesTags = course.tags.some((tag) =>
        tag.toLowerCase().includes(query),
      );
      return matchesTitle || matchesDescription || matchesCategory || matchesTags;
    });
  }, [normalizedPublishedCourses, searchQuery]);

  const filteredFeaturedCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return normalizedFeaturedCourses;
    }
    return normalizedFeaturedCourses.filter((course) => {
      const matchesTitle = course.title.toLowerCase().includes(query);
      const matchesDescription = (course.description ?? '')
        .toLowerCase()
        .includes(query);
      const matchesTags = course.tags.some((tag) =>
        tag.toLowerCase().includes(query),
      );
      return matchesTitle || matchesDescription || matchesTags;
    });
  }, [normalizedFeaturedCourses, searchQuery]);

  const categoryRows = useMemo(() => {
    const grouped = new Map<string, DiscoverCourse[]>();

    filteredPublishedCourses.forEach((course) => {
      const category = course.category ?? 'Uncategorized';
      const existing = grouped.get(category);
      if (existing) {
        existing.push(course);
      } else {
        grouped.set(category, [course]);
      }
    });

    const preferenceSet = new Set(preferences ?? []);
    const preferredRows: Array<{ title: string; courses: DiscoverCourse[] }> = [];
    const otherRows: Array<{ title: string; courses: DiscoverCourse[] }> = [];

    Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([title, groupedCourses]) => {
        const sortedCourses = [...groupedCourses].sort((a, b) =>
          a.title.localeCompare(b.title),
        );
        if (preferenceSet.has(title)) {
          preferredRows.push({ title, courses: sortedCourses });
        } else {
          otherRows.push({ title, courses: sortedCourses });
        }
      });

    return [...preferredRows, ...otherRows];
  }, [filteredPublishedCourses, preferences]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-6">
        <section className={glassPanelClass}>
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
            Discover
          </div>
          <Heading1 className="mt-3 text-slate-900">Explore Courses</Heading1>
          <p className="mt-2 text-sm text-slate-600">
            Browse featured releases and category collections.
          </p>
          <div className="mt-4 w-full sm:w-80">
            <SearchBar
              placeholder="Search by title, category, or tags"
              onSearch={setSearchQuery}
            />
          </div>
        </section>

        <section className={`${glassPanelClass} flex flex-1 flex-col gap-7`}>
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
          ) : categoryRows.length === 0 && filteredFeaturedCourses.length === 0 ? (
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="text-lg font-semibold">No courses found</p>
            </div>
          ) : (
            <>
              {isLoadingFeatured ? (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
                  <p className="animate-pulse text-sm">
                    Loading featured courses...
                  </p>
                </div>
              ) : (
                <DiscoverFeaturedCarousel courses={filteredFeaturedCourses} />
              )}

              {categoryRows.map((row) => (
                <DiscoverCategoryCarousel
                  key={row.title}
                  title={row.title}
                  courses={row.courses}
                />
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
