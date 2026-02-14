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
import type { Course } from '@/lib/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BookOpen, FileText, HelpCircle, Plus } from 'lucide-react';

dayjs.extend(relativeTime);

type EditorCourseDisplayProps = {
  course: Course;
};

export default function EditorCourseDisplay({
  course,
}: EditorCourseDisplayProps) {
  const { doc, addSection, setCurrentSection } = useContentEditor();

  const sections = doc.getArray('root');
  const sectionCount = sections.length;
  const quizCount = Array.from(sections).filter(
    (section) => section.get('type') === 'quiz',
  ).length;

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mx-auto w-full max-w-4xl space-y-2">
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

        {sectionCount === 0 && (
          <Card>
            <CardContent className="flex min-h-75 flex-col items-center justify-center p-8">
              <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
                <FileText className="text-muted-foreground size-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No sections yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
                Start building your course content by creating your first
                section.
              </p>
              <Button
                onClick={() => {
                  addSection();
                  setCurrentSection(0);
                }}
                size="lg"
              >
                <Plus className="mr-2 size-5" />
                Create First Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
