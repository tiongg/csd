import type { SectionType } from '@/lib/content.type';
import type { Course, EnrolledCourse } from '@/lib/utils';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

type CourseViewerContextProps = {
  course: Course;
  sections: SectionType[];
  enrollment: EnrolledCourse;
};

type CourseViewerContextType = {
  course: Course;
  sections: SectionType[];
  enrollment: EnrolledCourse;

  currentSectionIndex: number;
  currentSection?: SectionType;

  goNextSection: () => void;
  goPreviousSection: () => void;

  canNavigate: boolean;
  setCanNavigate: (canNavigate: boolean) => void;
};

const CourseViewerContext = createContext<CourseViewerContextType | undefined>(
  undefined,
);

export function CourseViewerProvider({
  course,
  sections,
  enrollment,
  children,
}: PropsWithChildren<CourseViewerContextProps>) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [canNavigate, setCanNavigate] = useState(true);
  const currentSection = sections[currentSectionIndex];

  // Reset navigation lock when section changes
  useEffect(() => {
    setCanNavigate(currentSection?.type !== 'quiz');
  }, [currentSection]);

  function goNextSection() {
    setCurrentSectionIndex((prev) => Math.min(prev + 1, sections.length - 1));
  }

  function goPreviousSection() {
    setCurrentSectionIndex((prev) => Math.max(prev - 1, -1));
  }

  return (
    <CourseViewerContext.Provider
      value={{
        course,
        sections,
        enrollment,

        currentSectionIndex,
        currentSection,

        goNextSection,
        goPreviousSection,

        canNavigate,
        setCanNavigate,
      }}
    >
      {children}
    </CourseViewerContext.Provider>
  );
}

export default function useCourseViewer() {
  const context = useContext(CourseViewerContext);
  if (!context) {
    throw new Error(
      'useCourseViewer must be used within a CourseViewerProvider',
    );
  }
  return context;
}
