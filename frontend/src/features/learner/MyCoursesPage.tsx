import SearchBar from '@/components/ui/searchbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading1 } from '@/components/ui/typography';
import { useState } from 'react';
import { AllCourses } from './all-courses/AllCourses';
import { EnrolledCourses } from './enrolled-courses/EnrolledCourses';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-full w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-5">
        <section className={glassPanelClass}>
          <div className="flex flex-col gap-4">
            <div>
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
                Learning Hub
              </div>
              <Heading1 className="mt-3 text-slate-900">My Courses</Heading1>
              <p className="mt-2 text-sm text-slate-600">
                Track your enrolled courses and discover new ones.
              </p>
            </div>
          </div>
        </section>

        <section className={`${glassPanelClass} flex flex-1 flex-col`}>
          <Tabs defaultValue="enrolled" className="flex h-full flex-1 flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="rounded-lg border border-slate-300/85 bg-slate-100/70 p-1">
                <TabsTrigger value="enrolled" className="cursor-pointer px-4">
                  Enrolled
                </TabsTrigger>
                <TabsTrigger value="all" className="cursor-pointer px-4">
                  All Courses
                </TabsTrigger>
              </TabsList>
              <div className="w-full sm:w-72">
                <SearchBar
                  placeholder="Search for courses"
                  onSearch={setSearchQuery}
                />
              </div>
            </div>

            <TabsContent value="enrolled" className="flex-1">
              <EnrolledCourses searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="all" className="flex-1">
              <AllCourses searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
