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
  const stats = [
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-xl leading-tight text-slate-900">
                {course.title}
              </CardTitle>
              <CardDescription className="text-base">
                {course.description || 'No description provided.'}
              </CardDescription>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex w-full flex-col items-start gap-3 lg:w-auto lg:items-end">
            <PublishCourse course={course} />
          </div>
        </div>

        <CourseImageOverview
          className="min-h-[240px]"
          imageClassName="h-[240px] w-full object-cover md:h-[320px]"
        />

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100/80">
                <stat.icon className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
