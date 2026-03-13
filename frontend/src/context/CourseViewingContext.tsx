import type { SectionType } from '@/lib/content.type';
import type { Course } from '@/lib/utils';
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

type CourseViewerContextProps = {
  course: Course;
  sections: SectionType[];
};

type CourseViewerContextType = {
  course: Course;
  sections: SectionType[];

  currentSectionIndex: number;
  currentSection?: SectionType;

  goNextSection: () => void;
  goPreviousSection: () => void;
};

const CourseViewerContext = createContext<CourseViewerContextType | undefined>(
  undefined,
);

export function CourseViewerProvider({
  course,
  sections,
  children,
}: PropsWithChildren<CourseViewerContextProps>) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const currentSection = sections[currentSectionIndex];

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

        currentSectionIndex,
        currentSection,

        goNextSection,
        goPreviousSection,
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
