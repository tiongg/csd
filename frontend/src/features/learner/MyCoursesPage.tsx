import SearchBar from '@/components/ui/searchbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading1 } from '@/components/ui/typography';
import { useApiQuery } from '@/lib/fetch-client';
import {
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useState } from 'react';

type CourseCardProps = {
  name: string;
  date: string;
  onClick?: () => void;
};

function CourseCard({ name, date, onClick }: CourseCardProps) {
  return (
    <div
      className="group bg-card relative cursor-pointer overflow-hidden rounded-lg border-2 border-slate-200 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex h-full flex-col justify-between p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <ClockIcon className="size-4" />
            <span>Last updated: {dayjs(date).fromNow()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const {
    data: courses,
    isLoading,
    isError,
  } = useApiQuery('get', '/api/courses/');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredCourses = (courses ?? []).filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.creatorId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStartNew = () => {
    navigate({ to: '/learner/discover' });
  };

  const handleViewCourse = (courseId: string) => {
    navigate({
      to: '/learner/courses/$courseId',
      params: { courseId },
    });
  };

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex h-64 w-full items-center justify-center text-slate-500">
          <p className="animate-pulse text-sm">Loading courses...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex h-64 w-full items-center justify-center text-slate-500">
          <p className="text-sm">
            Failed to load courses. Please try again later.
          </p>
        </div>
      );
    }

    if (filteredCourses.length === 0) {
      return (
        <div className="flex h-64 w-full items-center justify-center text-slate-500">
          <div className="text-center">
            <p className="text-lg font-semibold">No courses yet</p>
            <p className="mb-4 text-sm">
              Explore our course catalog to start learning!
            </p>
            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
            >
              <CheckCircleIcon className="size-5" />
              Explore Courses
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            name={course.title}
            date={course.updatedAt}
            onClick={() => handleViewCourse(course.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Heading1>My Courses</Heading1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-rose-500">
              <div className="text-xl font-bold">{filteredCourses.length}</div>
              <FireIcon className="ml-2 size-8" />
            </div>
            <SearchBar
              placeholder="Search for Courses"
              onSearch={setSearchQuery}
            />
          </div>
        </div>
        <p className="font-subtitle">Track your learning progress</p>
      </div>

      <div className="text-slate-800">
        <Tabs defaultValue="all">
          <TabsList variant="line">
            <TabsTrigger value="all" className="cursor-pointer">
              All Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderContent()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
