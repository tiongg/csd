import type { SectionType } from '@/lib/content.type';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import type {
  Course,
  EnrolledCourse,
  LearnerCourseMetadata,
} from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
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
  const metadata = enrollment.metadata as LearnerCourseMetadata;
  const [currentSectionIndex, setCurrentSectionIndex] = useState(
    metadata?.currentIndex ?? -1,
  );
  const [canNavigate, setCanNavigate] = useState(true);
  const currentSection = sections[currentSectionIndex];
  const queryClient = useQueryClient();

  const { mutateAsync: updateEnrollmentMetadata } = useApiMutation(
    'put',
    '/api/learner/lesson/{lessonId}/metadata',
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          apiQueryOptions('get', '/api/learner/lesson/enrolled'),
        );
      },
    },
  );

  function updateMetadata(newMetadata: LearnerCourseMetadata) {
    return updateEnrollmentMetadata({
      params: {
        path: {
          lessonId: enrollment.lessonSessionId,
        },
      },
      body: {
        metadata: {
          ...metadata,
          ...newMetadata,
        },
      },
    });
  }

  // Reset navigation lock when section changes
  useEffect(() => {
    setCanNavigate(currentSection?.type !== 'quiz');
  }, [currentSection]);

  function goNextSection() {
    setCurrentSectionIndex((prev) => Math.min(prev + 1, sections.length - 1));
    const newIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
    updateMetadata({ currentIndex: newIndex });
  }

  function goPreviousSection() {
    setCurrentSectionIndex((prev) => Math.max(prev - 1, -1));
    const newIndex = Math.max(currentSectionIndex - 1, -1);
    updateMetadata({ currentIndex: newIndex });
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
