import { Badge } from '@/components/ui/badge';
import useCourseViewer from '@/context/CourseViewingContext';
import { match } from 'ts-pattern';
import CourseFinish from './CourseFinish';
import CourseMarkdownDisplay from './CourseMarkdownDisplay';
import CourseNavigationFooter from './CourseNavigationFooter';
import CourseOverview from './CourseOverview';
import CourseQuiz from './CourseQuiz';

export default function CourseView() {
  const { sections, currentSectionIndex, currentSection, course, enrollment } =
    useCourseViewer();

  // Progress is based on completed sections (current position), not including current
  const progressPercent =
    sections.length > 0
      ? Math.round((currentSectionIndex / sections.length) * 100)
      : 0;

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl p-8">
          <div className="mb-4 flex items-center gap-2">
            {currentSectionIndex >= 0 &&
              currentSectionIndex < sections.length && (
                <Badge variant="secondary" className="text-xs">
                  Section {currentSectionIndex + 1} of {sections.length}
                </Badge>
              )}
            {currentSectionIndex >= 0 && (
              <Badge variant="outline" className="text-xs">
                {progressPercent}% complete
              </Badge>
            )}
          </div>

          <div className="min-h-[400px]">
            {match(currentSection)
              .with(undefined, () => (
                <>
                  {currentSectionIndex == -1 ? (
                    <CourseOverview
                      course={course}
                      sections={sections}
                      enrollment={enrollment}
                    />
                  ) : (
                    <CourseFinish />
                  )}
                </>
              ))
              .with({ type: 'markdown' }, (section) => (
                <CourseMarkdownDisplay content={section.content} />
              ))
              .with({ type: 'quiz' }, (section) => (
                <CourseQuiz quiz={section.content} />
              ))
              .exhaustive()}
          </div>
        </div>
      </div>

      <CourseNavigationFooter />
    </div>
  );
}
