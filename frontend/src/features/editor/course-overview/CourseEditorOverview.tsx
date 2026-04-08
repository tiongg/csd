import CourseMetricsGrid, {
  type CourseMetric,
} from '@/components/CourseMetricsGrid';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { useContentEditor } from '@/context/ContentEditorContext';
import type { EditableSectionType } from '@/lib/content.type';
import type { Course } from '@/lib/utils';
import { FileText, HelpCircle, Tag } from 'lucide-react';
import CourseImageOverview from '../course-image-overview/CourseImageOverview';
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
  const metrics: CourseMetric[] = [
    {
      label: 'Sections',
      value: sectionCount,
      icon: FileText,
    },
    {
      label: 'Quizzes',
      value: quizCount,
      icon: HelpCircle,
    },
    ...(tags.length > 0
      ? [
          {
            label: 'Tags',
            value: tags.length,
            icon: Tag,
          },
        ]
      : []),
  ];

  return (
    <Card className="gap-0 border-slate-200/90 bg-white/90 py-0 shadow-sm">
      <CardContent className="space-y-3 p-4 md:p-5">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="min-w-0 flex-1 text-xl leading-[1.15] text-slate-900">
              {course.title}
            </CardTitle>
            <div className="flex shrink-0 items-center">
              <PublishCourse course={course} />
            </div>
          </div>

          <CardDescription className="text-base">
            {course.description || 'No description provided.'}
          </CardDescription>

          {(course.category || tags.length > 0) && (
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                {course.category}
              </Badge>
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <CourseImageOverview
          className="min-h-[300px]"
          imageClassName="h-[300px] w-full object-cover md:h-[420px]"
        />

        <CourseMetricsGrid metrics={metrics} />
      </CardContent>
    </Card>
  );
}
