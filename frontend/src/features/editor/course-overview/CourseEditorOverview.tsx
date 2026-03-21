import {
  Badge,
} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useContentEditor } from '@/context/ContentEditorContext';
import type { EditableSectionType } from '@/lib/content.type';
import type { Course } from '@/lib/utils';
import { FileText, HelpCircle, Tag } from 'lucide-react';
import PublishCourse from './PublishCourse';

type CourseEditorOverviewProps = {
  course: Course;
};

export default function CourseEditorOverview({
  course,
}: CourseEditorOverviewProps) {
  const { doc } = useContentEditor();

  const sections = doc.getArray('root');
  const sectionCount = sections.length;
  const quizCount = Array.from<EditableSectionType>(sections).filter(
    (section) => section.get('type') === 'quiz',
  ).length;

  const tags = (course as { tags?: string[] }).tags ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-2xl">{course.title}</CardTitle>
            <CardDescription className="text-base">
              {course.description || 'No description provided.'}
            </CardDescription>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <PublishCourse course={course} />
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
          {tags.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
                <Tag className="text-primary size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tags</p>
                <p className="font-semibold">{tags.length}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
