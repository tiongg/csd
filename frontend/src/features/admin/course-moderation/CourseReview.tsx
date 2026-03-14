import { Button } from '@/components/ui/button';
import { useContentReview } from '@/context/ContentReviewContext';
import { type SectionType } from '@/lib/content.type';
import { match } from 'ts-pattern';
import MarkdownViewer from './MarkdownViewer';
import QuizViewer from './QuizViewer';

type ReviewSectionViewerProps = {
  section: SectionType;
};

function ReviewSectionViewer({ section }: ReviewSectionViewerProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {match(section)
        .with({ type: 'markdown' }, (s) => (
          <MarkdownViewer content={s.content} />
        ))
        .with({ type: 'quiz' }, (s) => (
          <div className="p-4">
            <QuizViewer quiz={s.content} />
          </div>
        ))
        .exhaustive()}
    </div>
  );
}

export default function CourseReview() {
  const { content, currentSection, setCurrentSection } = useContentReview();

  const sectionCount = content.length;
  const currentSectionData = currentSection >= 0 ? content[currentSection] : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="bg-muted/40 flex shrink-0 items-center gap-2 overflow-x-auto border-b p-2">
        <Button
          size="sm"
          variant={currentSection === -1 ? 'default' : 'ghost'}
          onClick={() => setCurrentSection(-1)}
        >
          Overview
        </Button>
        <div className="bg-border mx-2 h-6 w-px shrink-0" />
        <div className="flex gap-1">
          {content.map((section, index) => (
            <Button
              key={index}
              size="sm"
              variant={currentSection === index ? 'default' : 'ghost'}
              onClick={() => setCurrentSection(index)}
            >
              {section.title}
            </Button>
          ))}
        </div>
      </nav>
      {currentSection === -1 || !currentSectionData ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-4xl">
            <h2 className="text-xl font-semibold">Course Content Overview</h2>
            <p className="text-muted-foreground">
              This course has {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}.
            </p>
          </div>
        </div>
      ) : (
        <ReviewSectionViewer section={currentSectionData} />
      )}
    </div>
  );
}
