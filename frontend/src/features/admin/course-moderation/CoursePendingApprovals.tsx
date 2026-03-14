import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';

export function CoursePendingApprovals() {
  const { data: pendingCourses } = useApiQuery(
    'get',
    '/api/content-versions/pending',
  );
  const [selectedCourses, setSelectedCourses] = useState(new Set<string>());

  function handleSelect(id: string) {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  if (!pendingCourses) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full items-center justify-between gap-x-2">
        <h3 className="text-lg font-semibold text-slate-700">
          {pendingCourses.length} Pending{' '}
          {pendingCourses.length === 1 ? 'Course' : 'Courses'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={() => {}}
            className="cursor-pointer rounded-full"
          >
            <XCircleIcon className="size-4" />
            Reject
          </Button>
          <Button
            variant="default"
            onClick={() => {}}
            className="cursor-pointer rounded-full"
          >
            <CheckCircleIcon className="size-4" />
            Approve
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead className="w-3/4">Course Name</TableHead>
            <TableHead className="w-1/4">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingCourses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8 text-center text-slate-500"
              >
                No pending course approvals
              </TableCell>
            </TableRow>
          ) : (
            pendingCourses.map(({ course }) => (
              <TableRow
                key={course.id}
                onClick={() => handleSelect(course.id)}
                className={cn(
                  'cursor-pointer',
                  selectedCourses.has(course.id) && 'bg-slate-100',
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedCourses.has(course.id)}
                    className="border-slate-800"
                    onClick={(event) => event.stopPropagation()}
                    onCheckedChange={() => handleSelect(course.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>
                  {dayjs(course.createdAt).format('MMM D, YYYY h:mm A')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
