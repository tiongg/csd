import { Button } from '@/components/ui/button';
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white/90 p-3 shadow-sm">
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

      <div className="text-muted-foreground min-w-0 flex-1 truncate px-2 text-center text-sm font-medium">
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
  );
}
