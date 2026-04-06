import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useCourseViewer from '@/context/CourseViewingContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CourseNavigationFooter() {
  const {
    course,
    sections,
    goPreviousSection,
    goNextSection,
    currentSectionIndex,
    currentSection,
    canNavigate,
  } = useCourseViewer();

  const currentSectionTitle = currentSection?.title ?? course.title;
  const isQuiz = currentSection?.type === 'quiz';
  const isDisabled = isQuiz && !canNavigate;

  return (
    <>
      <Separator />
      <div className="border-border/40 bg-muted/30 border-t p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goPreviousSection}
            disabled={currentSectionIndex === -1}
            className="gap-2 transition duration-300 active:scale-95"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <div className="text-muted-foreground max-w-md truncate px-4 text-sm font-medium">
            {currentSectionTitle}
          </div>

          <Button
            size="sm"
            onClick={goNextSection}
            disabled={currentSectionIndex === sections.length || isDisabled}
            className="gap-2 transition duration-300 active:scale-95 hover:bg-sky-400"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
