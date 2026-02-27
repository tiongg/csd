import { PlayIcon, UserIcon, CalendarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { Heading1, Heading2, Heading3 } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Course = {
  id: string;
  title: string;
  description: string | null;
  creatorId: string;
  teamId: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

type CourseViewProps = {
  courseId: string;
  course: Course;
};

export default function CourseView({ courseId, course }: CourseViewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto p-8">
      {/* Course Header */}
      <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
        <Heading1>{course.title}</Heading1>
        <p className="text-muted-foreground text-sm">
          {course.description || 'No description provided'}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <UserIcon className="size-4" />
            <span>Created by: {course.creatorId}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4" />
            <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4" />
            <span>Last updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Course Content Tabs */}
      <div className="flex-1">
        <Tabs defaultValue="content" className="h-full flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="content" className="cursor-pointer">
              <PlayIcon className="mr-2 size-4" />
              Course Content
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="cursor-pointer">
              <BookOpenIcon className="mr-2 size-4" />
              Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="flex-1">
            <div className="flex h-full flex-col items-center justify-center text-slate-500">
              <BookOpenIcon className="mb-4 size-12" />
              <Heading3>Course Content</Heading3>
              <p className="text-center max-w-md">
                Course content will be displayed here when the editor is integrated
                with the learner view. This section will show sections, lessons,
                and learning materials.
              </p>
              <Button variant="outline" className="mt-6 cursor-pointer">
                Start Learning
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="flex-1">
            <div className="flex h-full flex-col items-center justify-center text-slate-500">
              <BookOpenIcon className="mb-4 size-12" />
              <Heading3>Quizzes</Heading3>
              <p className="text-center max-w-md">
                Quizzes for this course will be displayed here. Learners can
                take quizzes to test their knowledge and track progress.
              </p>
              <Button variant="outline" className="mt-6 cursor-pointer">
                Take Quiz
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
