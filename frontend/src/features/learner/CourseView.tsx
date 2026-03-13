import { Badge } from '@/components/ui/badge';
import useCourseViewer from '@/context/CourseViewingContext';
import { match } from 'ts-pattern';
import CourseMarkdownDisplay from './CourseMarkdownDisplay';
import CourseNavigationFooter from './CourseNavigationFooter';
import CourseOverview from './CourseOverview';

export default function CourseView() {
  const { sections, currentSectionIndex, currentSection } = useCourseViewer();

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
            {currentSectionIndex >= 0 && (
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
              .with(undefined, () => <CourseOverview />)
              .with({ type: 'markdown' }, (section) => (
                <CourseMarkdownDisplay content={section.content} />
              ))
              .with({ type: 'quiz' }, (section) => (
                <div>Quiz: {section.content.question}</div>
              ))
              .exhaustive()}
          </div>
        </div>
      </div>

      <CourseNavigationFooter />
    </div>
  );
}
