import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SearchBar from '@/components/ui/searchbar';
import { useApiQuery, useApiMutation } from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

type Course = {
  id: string;
  title: string;
  creatorId: string;
  teamId: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

function PendingApprovals() {
  const { data: courses } = useApiQuery('get', '/api/courses', {});

  // Filter to show only unpublished (pending) courses
  const pendingCourses = (courses ?? []).filter((c) => c.isPublished === false);

  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { mutate: approveCourse, isPending: isApproving } = useApiMutation(
    'patch',
    '/api/courses/{courseId}',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['get', '/api/courses'],
        });
        toast.success('Course approved successfully');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to approve course');
      },
    },
  );

  const { mutate: rejectCourse, isPending: isRejecting } = useApiMutation(
    'delete',
    '/api/courses/{courseId}',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['get', '/api/courses'],
        });
        toast.success('Course rejected successfully');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to reject course');
      },
    },
  );

  const handleSelect = (courseId: string) => {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleApprove = () => {
    selectedCourses.forEach((courseId) => {
      approveCourse({
        params: { path: { courseId } },
        body: { isPublished: true },
      });
    });
  };

  const handleReject = () => {
    selectedCourses.forEach((courseId) => {
      rejectCourse({
        params: { path: { courseId } },
      });
    });
  };

  const isAllSelected =
    pendingCourses.length > 0 && selectedCourses.size === pendingCourses.length;

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full items-center justify-between gap-x-2">
        <h3 className="text-lg font-semibold text-slate-700">
          {pendingCourses.length} Pending {pendingCourses.length === 1 ? 'Course' : 'Courses'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSelect('all')}
            className="cursor-pointer rounded-full"
            disabled={isAllSelected}
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
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-3/6">Course Name</TableHead>
            <TableHead className="w-2/6">Creator</TableHead>
            <TableHead className="w-1/6">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {pendingCourses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                No pending course approvals
              </TableCell>
            </TableRow>
          ) : (
            pendingCourses.map((course) => (
              <TableRow
                key={course.id}
                onClick={() => handleSelect(course.id)}
                className={cn(
                  'cursor-pointer hover:bg-slate-50',
                  selectedCourses.has(course.id) && 'bg-slate-100'
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedCourses.has(course.id)}
                    className="border-slate-800"
                    onChange={() => handleSelect(course.id)}
                  />
                </TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.creatorId}</TableCell>
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

function AllAdmins() {
  const { data: courses } = useApiQuery('get', '/api/courses', {});

  // Show all courses (both published and unpublished)
  const allCourses = courses ?? [];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = allCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.creatorId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full justify-end gap-x-2">
        <SearchBar placeholder="Search for Courses" onSearch={setSearchQuery} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/6">Course Name</TableHead>
            <TableHead className="w-2/6">Creator</TableHead>
            <TableHead className="w-1/6">Status</TableHead>
            <TableHead className="w-1/6">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredCourses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                No courses found
              </TableCell>
            </TableRow>
          ) : (
            filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.creatorId}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      course.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {course.isPublished ? 'Published' : 'Pending'}
                  </span>
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
            <AllAdmins />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
