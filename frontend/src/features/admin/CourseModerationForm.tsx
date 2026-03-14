import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading1 } from '@/components/ui/typography';
import { CoursePendingApprovals } from './course-moderation/CoursePendingApprovals';

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
            <CoursePendingApprovals />
          </TabsContent>

          {/* <TabsContent value="courses">
            <AllCourses />
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}
