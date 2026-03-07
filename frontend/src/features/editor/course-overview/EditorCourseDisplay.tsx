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
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mx-auto w-full max-w-4xl space-y-2">
        <CourseEditorOverview course={course} />
        {sectionCount === 0 && <NoCourseSectionsYet />}
        <CourseVersions course={course} />
      </div>
    </div>
  );
}
