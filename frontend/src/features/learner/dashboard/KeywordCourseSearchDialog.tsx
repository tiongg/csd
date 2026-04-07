import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn, type Course } from '@/lib/utils';
import { useApiQuery } from '@/lib/fetch-client';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';

type KeywordCourseSearchDialogProps = {
  initialSearchValue: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MAX_RESULTS = 8;

function extractCourse(courseEntry: { course: Course } | Course) {
  return 'course' in courseEntry ? courseEntry.course : courseEntry;
}

function normalize(value: string | null | undefined) {
  return (value ?? '').toLowerCase().trim();
}

export function KeywordCourseSearchDialog({
  initialSearchValue,
  open,
  onOpenChange,
}: KeywordCourseSearchDialogProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState(initialSearchValue);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { data: courses, isLoading, isError } = useApiQuery(
    'get',
    '/api/courses/published',
  );
  const { data: enrolledLessons } = useApiQuery(
    'get',
    '/api/learner/lesson/enrolled',
    {},
    {
      enabled: user?.role === 'LEARNER',
      retry: false,
    },
  );

  const publishedCourses = (courses ?? []) as Array<{ course: Course } | Course>;
  const query = normalize(search);
  const enrollmentByCourseId = useMemo(() => {
    const map = new Map<string, string>();
    (enrolledLessons?.enrolledLessons ?? []).forEach((item) => {
      map.set(item.course.id, item.status);
    });
    return map;
  }, [enrolledLessons]);

  const filteredCourses = useMemo(() => {
    return publishedCourses
      .map((courseEntry) => extractCourse(courseEntry))
      .filter((course) => {
        if (!query) {
          return true;
        }
        const title = normalize(course.title);
        const description = normalize(course.description);
        const tags = (course.tags ?? []).map((tag) => normalize(tag));
        return (
          title.includes(query) ||
          description.includes(query) ||
          tags.some((tag) => tag.includes(query))
        );
      })
      .sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
      .slice(0, MAX_RESULTS);
  }, [publishedCourses, query]);

  useEffect(() => {
    if (open) {
      setSearch(initialSearchValue);
    }
  }, [open, initialSearchValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-xl border-slate-200 p-5 sm:max-w-3xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const input = searchInputRef.current;
          if (!input) {
            return;
          }

          input.focus();
          const caretPosition = input.value.length;
          input.setSelectionRange(caretPosition, caretPosition);
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-sky-900">Keyword to Course Match</DialogTitle>
          <DialogDescription className="text-slate-600">
            Search courses using this keyword.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword"
            className="h-11 border-slate-300 bg-white focus-visible:border-slate-400 focus-visible:ring-0"
          />

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              Finding matching courses...
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-dashed border-rose-300 bg-rose-50 p-5 text-sm text-rose-700">
              Unable to load published courses right now.
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                {filteredCourses.length} result{filteredCourses.length > 1 ? 's' : ''}
              </p>
              <div className="max-h-[28rem] space-y-2 overflow-auto pr-1">
                {filteredCourses.map((course) => {
                  const visibleTags = (course.tags ?? []).slice(0, 4);
                  const remainingTagCount = Math.max(
                    0,
                    (course.tags ?? []).length - visibleTags.length,
                  );

                  return (
                    <Link
                      key={course.id}
                      to="/learner/courses/$courseId"
                      params={{ courseId: course.id }}
                      onClick={() => onOpenChange(false)}
                      className="group block rounded-xl border border-slate-300 bg-white p-4 transition-colors hover:border-slate-400 hover:bg-slate-50/40"
                    >
                      <div className="flex gap-3">
                        <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:h-28 sm:w-44">
                          {course.imageUrl ? (
                            <img
                              src={course.imageUrl}
                              alt={course.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                              No thumbnail
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                              {course.title}
                            </p>
                            {enrollmentByCourseId.get(course.id) && (
                              <span
                                className={cn(
                                  'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                                  enrollmentByCourseId.get(course.id) === 'COMPLETED'
                                    ? 'border-slate-300 bg-slate-900 text-white'
                                    : 'border-slate-300 bg-slate-100 text-slate-700',
                                )}
                              >
                                {enrollmentByCourseId.get(course.id) === 'COMPLETED'
                                  ? 'Completed'
                                  : 'Enrolled'}
                              </span>
                            )}
                          </div>
                          {course.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                              {course.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-500">
                            Updated {dayjs(course.updatedAt).fromNow()}
                          </p>

                          <div className="mt-auto pt-2 flex items-center gap-1.5 overflow-hidden">
                            <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              {course.category}
                            </span>
                            {visibleTags.map((tag) => (
                              <span
                                key={`${course.id}-${tag}`}
                                className="inline-flex min-w-0 max-w-[120px] items-center truncate rounded-full border border-sky-200 bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700"
                              >
                                #{tag}
                              </span>
                            ))}
                            {remainingTagCount > 0 && (
                              <span className="inline-flex shrink-0 items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                                +{remainingTagCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              No matching course found for this keyword yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
