import CourseMetricsGrid, {
  type CourseMetric,
} from '@/components/CourseMetricsGrid';
import { useContentEditor } from '@/context/ContentEditorContext';
import type { EditableSectionType } from '@/lib/content.type';
import type { Course } from '@/lib/utils';
import { FileText, HelpCircle, Tag } from 'lucide-react';
import CourseEditorOverview from './CourseEditorOverview';
import CourseVersions from './CourseVersions';
import NoCourseSectionsYet from './NoCourseSectionsYet';

type EditorCourseDisplayProps = {
  course: Course;
};

export default function EditorCourseDisplay({
  course,
}: EditorCourseDisplayProps) {
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
    <div className="flex h-full flex-col overflow-auto px-6 pt-3 pb-6 md:px-8 md:pt-4 md:pb-8">
      <div className="mx-auto w-full max-w-4xl space-y-3">
        <CourseEditorOverview course={course} />
        <CourseMetricsGrid metrics={metrics} />
        <div className="flex flex-col gap-y-1.5">
          {sectionCount === 0 && <NoCourseSectionsYet />}
        </div>
        <CourseVersions course={course} />
      </div>
    </div>
  );
}
