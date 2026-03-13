import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { SectionType } from '@/lib/content.type';
import type { Course } from '@/lib/utils';
import CourseMarkdownDisplay from './CourseMarkdownDisplay';

type CourseViewProps = {
  course: Course;
  content: SectionType[];
};

export default function CourseView({ course, content }: CourseViewProps) {
  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4 overflow-hidden p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {course.description ?? 'No description provided'}
          </p>
        </CardHeader>
      </Card>

      <div className="h-full min-h-0 flex-1">
        {content[0]?.type === 'markdown' && (
          <CourseMarkdownDisplay content={content[0].content} />
        )}
      </div>
    </div>
  );
}
