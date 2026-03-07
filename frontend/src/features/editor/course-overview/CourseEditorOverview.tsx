import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useContentEditor } from '@/context/ContentEditorContext';
import { uploadCourseContent } from '@/lib/file-upload';
import type { Course } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, FileText, HelpCircle, Send } from 'lucide-react';

type CourseEditorOverviewProps = {
  course: Course;
};

export default function CourseEditorOverview({
  course,
}: CourseEditorOverviewProps) {
  const { doc, getDocAsJson } = useContentEditor();

  const { mutateAsync: uploadContent, isPending: isPublishing } = useMutation({
    mutationFn: async (description: string) => {
      const docContent = await getDocAsJson();
      return uploadCourseContent(docContent, course.id, description);
    },
  });

  const sections = doc.getArray('root');
  const sectionCount = sections.length;
  const quizCount = Array.from(sections).filter(
    (s) => s.get('type') === 'quiz',
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="size-3" />
                Course
              </Badge>
            </div>
            <CardTitle className="text-2xl">{course.title}</CardTitle>
            <CardDescription className="text-base">
              {course.description || 'No description provided.'}
            </CardDescription>

            <Button
              onClick={() =>
                uploadContent(
                  `Content update for course ${course.id} at ${new Date().toISOString()}`,
                )
              }
              disabled={sectionCount === 0}
              className="gap-2 transition duration-300 active:scale-95"
            >
              <Send className="size-4" />
              {isPublishing ? 'Submitting…' : 'Submit for Approval'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              <FileText className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Sections</p>
              <p className="font-semibold">{sectionCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              <HelpCircle className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Quizzes</p>
              <p className="font-semibold">{quizCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
