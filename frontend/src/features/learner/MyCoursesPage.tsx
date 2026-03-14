import SearchBar from '@/components/ui/searchbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading1 } from '@/components/ui/typography';
import { FireIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { AllCourses } from './all-courses/AllCourses';
import { EnrolledCourses } from './enrolled-courses/EnrolledCourses';

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Heading1>My Courses</Heading1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-rose-500">
              <div className="text-xl font-bold">0</div>
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
        <Tabs defaultValue="enrolled">
          <TabsList variant="line">
            <TabsTrigger value="enrolled" className="cursor-pointer">
              Enrolled
            </TabsTrigger>
            <TabsTrigger value="all" className="cursor-pointer">
              All Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled">
            <EnrolledCourses searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="all">
            <AllCourses searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
