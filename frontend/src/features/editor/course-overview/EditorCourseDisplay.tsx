import { useContentEditor } from '@/context/ContentEditorContext';
import type { Course } from '@/lib/utils';
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
  const sectionCount = doc.getArray('root').length;

  return (
    <div className="flex h-full flex-col overflow-auto px-6 pt-3 pb-6 md:px-8 md:pt-4 md:pb-8">
      <div className="mx-auto w-full max-w-4xl space-y-3">
        <CourseEditorOverview course={course} />
        <div className="flex flex-col gap-y-1.5">
          {sectionCount === 0 && <NoCourseSectionsYet />}
        </div>
        <CourseVersions course={course} />
      </div>
    </div>
  );
}
