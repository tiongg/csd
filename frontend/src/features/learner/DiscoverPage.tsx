import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DiscoverBrowseToolbar } from './discover/DiscoverBrowseToolbar';
import { DiscoverCategoryCarousel } from './discover/DiscoverCategoryCarousel';
import { DiscoverFeaturedCarousel } from './discover/DiscoverFeaturedCarousel';
import { type DiscoverCourse } from './discover/types';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

export default function DiscoverPage() {
  const { preferences } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('__all__');
  const hasAppliedPreferenceDefaultRef = useRef(false);
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

  const categoryRows = useMemo(() => {
    const grouped = new Map<string, DiscoverCourse[]>();

    normalizedPublishedCourses.forEach((course) => {
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
  }, [normalizedPublishedCourses, preferences]);

  const categoryOptions = useMemo(
    () => categoryRows.map((row) => row.title).sort((a, b) => a.localeCompare(b)),
    [categoryRows],
  );

  const preferredCategories = useMemo(() => {
    const preferred = (preferences ?? []).slice(0, 3);
    return new Set(preferred);
  }, [preferences]);

  const hasPreferredCategoriesInDiscover = useMemo(() => {
    if (preferredCategories.size === 0) {
      return false;
    }

    return categoryRows.some((row) => preferredCategories.has(row.title));
  }, [categoryRows, preferredCategories]);

  useEffect(() => {
    if (
      hasAppliedPreferenceDefaultRef.current ||
      !hasPreferredCategoriesInDiscover ||
      categoryFilter !== '__all__'
    ) {
      return;
    }

    setCategoryFilter('__preferences__');
    hasAppliedPreferenceDefaultRef.current = true;
  }, [categoryFilter, hasPreferredCategoriesInDiscover]);

  const filteredCategoryRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return categoryRows
      .map((row) => {
        const filteredCourses = row.courses.filter((course) => {
          const searchableText = [
            course.title,
            course.description ?? '',
            ...(course.tags ?? []),
          ]
            .join(' ')
            .toLowerCase();

          return normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);
        });

        return {
          ...row,
          courses: filteredCourses,
        };
      })
      .filter((row) => {
        const matchesCategory =
          categoryFilter === '__all__' ||
          (categoryFilter === '__preferences__' && preferredCategories.has(row.title)) ||
          row.title === categoryFilter;

        return matchesCategory && row.courses.length > 0;
      });
  }, [categoryFilter, categoryRows, preferredCategories, searchQuery]);

  return (
    <div className="flex">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-6">
        <section className={glassPanelClass}>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Discover
          </p>
          <Heading1 className="mt-3 text-slate-900">Explore Courses</Heading1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Browse featured releases and category collections.
          </p>
        </section>

        <section className={glassPanelClass}>
          {isLoadingFeatured ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="animate-pulse text-sm">Loading featured courses...</p>
            </div>
          ) : normalizedFeaturedCourses.length > 0 ? (
            <DiscoverFeaturedCarousel courses={normalizedFeaturedCourses} />
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="text-sm">No featured courses found.</p>
            </div>
          )}
        </section>

        <section className={`${glassPanelClass} flex flex-1 flex-col gap-6`}>
          <DiscoverBrowseToolbar
            onSearchQueryChange={setSearchQuery}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categoryOptions={categoryOptions}
            showMyPreferencesOption={hasPreferredCategoriesInDiscover}
          />
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
          ) : filteredCategoryRows.length === 0 ? (
            <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-500">
              <p className="text-lg font-semibold">No courses found</p>
            </div>
          ) : (
            filteredCategoryRows.map((row) => (
              <DiscoverCategoryCarousel
                key={row.title}
                title={row.title}
                courses={row.courses}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
