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
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import type { Course } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, FileText, HelpCircle, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

type EditorCourseDisplayProps = {
  course: Course;
};

export default function EditorCourseDisplay({
  course,
}: EditorCourseDisplayProps) {
  const { doc, addSection, setCurrentSection } = useContentEditor();
  const queryClient = useQueryClient();

  const sections = doc.getArray('root');
  const sectionCount = sections.length;
  const quizCount = Array.from(sections).filter(
    (s) => s.get('type') === 'quiz',
  ).length;

  const { mutate: publishCourse, isPending: isPublishing } = useApiMutation(
    'put',
    '/api/courses/{id}',
    {
      onSuccess: () => {
        toast.success('Course submitted for approval', {
          description: 'Admins will review and publish your course.',
        });
        queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/courses/{id}', {
            params: { path: { id: course.id } },
          }).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/courses/').queryKey,
        });
      },
      onError: (err) => {
        toast.error('Failed to submit course', {
          description: (err as any)?.message ?? 'Please try again.',
        });
      },
    },
  );

  function handlePublish() {
    publishCourse({
      params: { path: { id: course.id } },
      body: { isPublished: true },
    });
  }

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

                {!course.isPublished && (
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing || sectionCount === 0}
                    className="gap-2"
                  >
                    <Send className="size-4" />
                    {isPublishing ? 'Submitting…' : 'Submit for Approval'}
                  </Button>
                )}

                {course.isPublished && (
                  <div className="inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-1.5 text-sm text-green-700">
                    <BookOpen className="size-4" />
                    This course is live and visible to learners
                  </div>
                )}

                {!course.isPublished && sectionCount === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add at least one section before submitting.
                  </p>
                )}
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
                size="lg"
                onClick={() => {
                  addSection('markdown');
                  setCurrentSection(0);
                }}
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
