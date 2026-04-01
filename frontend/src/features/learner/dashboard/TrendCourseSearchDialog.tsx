import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useApiQuery } from '@/lib/fetch-client';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

type TrendCourseSearchDialogProps = {
  initialSearchValue: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TrendCourseSearchDialog({
  initialSearchValue,
  open,
  onOpenChange,
}: TrendCourseSearchDialogProps) {
  const [search, setSearch] = useState(initialSearchValue);

  const { data: courses } = useApiQuery('get', '/api/courses/published');
  const publishedCourses = courses ?? [];
  const filteredCourses = publishedCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (course.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  // Reset search when initial value changes and dialog opens
  useEffect(() => {
    if (open) {
      setSearch(initialSearchValue);
    }
  }, [open, initialSearchValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trend to Course Match</DialogTitle>
          <DialogDescription>
            Search courses using this trend keyword.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                  onClick={() => onOpenChange(false)}
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
  );
}
