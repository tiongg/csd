import { useContentEditor } from '@/context/ContentEditorContext';
import type { Course } from '@/lib/utils';
import CourseEditorOverview from './CourseEditorOverview';
import CourseVersions from './CourseVersions';
import NoCourseSectionsYet from './NoCourseSectionsYet';
import NoReelsYet from '../reel-overview/NoReelsYet';
import ReelsOverview from '../reel-overview/ReelsOverview';

type EditorCourseDisplayProps = {
  course: Course;
};

export default function EditorCourseDisplay({
  course,
}: EditorCourseDisplayProps) {
  const { doc } = useContentEditor();
  const sectionCount = doc.getArray('root').length;
  const reelsCount = 1;

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mx-auto w-full max-w-4xl space-y-2">
        <CourseEditorOverview course={course} />
        <div className={sectionCount + reelsCount === 0 ? 'lg:grid lg:grid-cols-2 lg:gap-x-2' : 'flex flex-col gap-y-2'}>
        {sectionCount === 0 && <NoCourseSectionsYet />}
        {reelsCount === 0 ? <NoReelsYet /> : <ReelsOverview />}
        </div>
        <CourseVersions course={course} />
      </div>
    </div>
  );
}
