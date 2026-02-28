import { CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Heading1 } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SearchBar from '@/components/ui/searchbar';
import { apiQueryOptions, useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import type { Course } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

// ─── Shared query key ─────────────────────────────────────────────────────────

function useCoursesQueryKey() {
  return apiQueryOptions('get', '/api/courses/').queryKey;
}

// ─── Pending Approvals Tab ────────────────────────────────────────────────────

function PendingApprovals() {
  const queryClient = useQueryClient();
  const coursesQueryKey = useCoursesQueryKey();

  const { data: courses } = useApiQuery('get', '/api/courses/', {});
  const pendingCourses = (courses ?? []).filter((c) => !c.isPublished);

  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  // ✅ PUT /api/courses/{id} — correct method + param name from spec
  const { mutate: approveCourse, isPending: isApproving } = useApiMutation(
    'put',
    '/api/courses/{id}',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: coursesQueryKey });
        toast.success('Course approved and published');
      },
      onError: (err) => {
        toast.error((err as any)?.message ?? 'Failed to approve course');
      },
    },
  );

  // ✅ DELETE /api/courses/{id} — correct param name from spec
  const { mutate: rejectCourse, isPending: isRejecting } = useApiMutation(
    'delete',
    '/api/courses/{id}',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: coursesQueryKey });
        toast.success('Course rejected and removed');
      },
      onError: (err) => {
        toast.error((err as any)?.message ?? 'Failed to reject course');
      },
    },
  );

  const handleSelect = (courseId: string) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      next.has(courseId) ? next.delete(courseId) : next.add(courseId);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedCourses(new Set(pendingCourses.map((c) => c.id)));
  };

  const handleApprove = () => {
    selectedCourses.forEach((id) => {
      approveCourse({ params: { path: { id } }, body: { isPublished: true } });
    });
    setSelectedCourses(new Set());
  };

  const handleReject = () => {
    selectedCourses.forEach((id) => {
      rejectCourse({ params: { path: { id } } });
    });
    setSelectedCourses(new Set());
  };

  const isAllSelected =
    pendingCourses.length > 0 &&
    selectedCourses.size === pendingCourses.length;

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full items-center justify-between gap-x-2">
        <h3 className="text-lg font-semibold text-slate-700">
          {pendingCourses.length} Pending{' '}
          {pendingCourses.length === 1 ? 'Course' : 'Courses'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="cursor-pointer rounded-full"
            disabled={isAllSelected || pendingCourses.length === 0}
          >
            Select All
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            className="cursor-pointer rounded-full"
            disabled={selectedCourses.size === 0 || isRejecting}
          >
            <XCircleIcon className="mr-2 size-4" />
            Reject
          </Button>
          <Button
            variant="default"
            onClick={handleApprove}
            className="cursor-pointer rounded-full"
            disabled={selectedCourses.size === 0 || isApproving}
          >
            <CheckCircleIcon className="mr-2 size-4" />
            Approve
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead className="w-3/6">Course Name</TableHead>
            <TableHead className="w-2/6">Creator ID</TableHead>
            <TableHead className="w-1/6">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingCourses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                No pending course approvals
              </TableCell>
            </TableRow>
          ) : (
            pendingCourses.map((course) => (
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
                <TableCell className="text-sm text-slate-500">
                  {course.creatorId}
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Take Down Confirmation Dialog ───────────────────────────────────────────

type TakeDownDialogProps = {
  course: Course | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
};

function TakeDownDialog({
  course,
  onConfirm,
  onCancel,
  isPending,
}: TakeDownDialogProps) {
  return (
    <Dialog open={!!course} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Take Down Course?</DialogTitle>
          <DialogDescription>
            "{course?.title}" will be unpublished and hidden from learners
            immediately. The course and its content are preserved — the
            contributor can re-submit for approval.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Taking down…' : 'Take Down'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── All Courses Tab ──────────────────────────────────────────────────────────

function AllCourses() {
  const queryClient = useQueryClient();
  const coursesQueryKey = useCoursesQueryKey();

  const { data: courses } = useApiQuery('get', '/api/courses/', {});
  const [searchQuery, setSearchQuery] = useState('');
  const [courseToTakeDown, setCourseToTakeDown] = useState<Course | null>(null);

  const filteredCourses = (courses ?? []).filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.creatorId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /**
   * "Take Down" = set isPublished to false on a currently published course.
   * Uses the same PUT /api/courses/{id} endpoint, just with isPublished: false.
   */
  const { mutate: takeDownCourse, isPending: isTakingDown } = useApiMutation(
    'put',
    '/api/courses/{id}',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: coursesQueryKey });
        toast.success('Course taken down', {
          description: 'The course is now hidden from learners.',
        });
        setCourseToTakeDown(null);
      },
      onError: (err) => {
        toast.error((err as any)?.message ?? 'Failed to take down course');
      },
    },
  );

  function handleConfirmTakeDown() {
    if (!courseToTakeDown) return;
    takeDownCourse({
      params: { path: { id: courseToTakeDown.id } },
      body: { isPublished: false },
    });
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full justify-end gap-x-2">
        <SearchBar placeholder="Search for Courses" onSearch={setSearchQuery} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/6">Course Name</TableHead>
            <TableHead className="w-1/6">Creator ID</TableHead>
            <TableHead className="w-1/6">Status</TableHead>
            <TableHead className="w-1/6">Created</TableHead>
            <TableHead className="w-1/6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                No courses found
              </TableCell>
            </TableRow>
          ) : (
            filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell className="text-sm text-slate-500">
                  {course.creatorId}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      course.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800',
                    )}
                  >
                    {course.isPublished ? 'Published' : 'Pending'}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {course.isPublished && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                      onClick={() => setCourseToTakeDown(course)}
                    >
                      <ArrowDownTrayIcon className="size-4" />
                      Take Down
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Confirmation dialog — only mounted when a course is selected */}
      <TakeDownDialog
        course={courseToTakeDown}
        onConfirm={handleConfirmTakeDown}
        onCancel={() => setCourseToTakeDown(null)}
        isPending={isTakingDown}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseModerationForm() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>Course Moderation</Heading1>
        <p className="font-subtitle">Review and manage course submissions</p>
      </div>

      <div className="text-slate-800">
        <Tabs defaultValue="pending">
          <TabsList variant="line">
            <TabsTrigger value="pending" className="cursor-pointer">
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="courses" className="cursor-pointer">
              All Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PendingApprovals />
          </TabsContent>

          <TabsContent value="courses">
            <AllCourses />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}