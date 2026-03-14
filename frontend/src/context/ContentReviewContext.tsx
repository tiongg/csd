import type { Course } from '@/lib/utils';
import type { SectionType } from '@/lib/content.type';
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

export type ContentReviewContextType = {
  course: Course;
  content: SectionType[];
  currentSection: number;
  setCurrentSection: (section: number) => void;
};

const ContentReviewContext = createContext<ContentReviewContextType | null>(
  null,
);

type ContentReviewProviderProps = PropsWithChildren<{
  course: Course;
  content: SectionType[];
  defaultSection?: number;
}>;

export function ContentReviewProvider({
  children,
  course,
  content,
  defaultSection = -1,
}: ContentReviewProviderProps) {
  const [currentSection, setCurrentSection] = useState(defaultSection);

  return (
    <ContentReviewContext.Provider
      value={{
        course,
        content,
        currentSection,
        setCurrentSection,
      }}
    >
      {children}
    </ContentReviewContext.Provider>
  );
}

export function useContentReview(): ContentReviewContextType {
  const context = useContext(ContentReviewContext);
  if (!context) {
    throw new Error('ContentReview context missing!');
  }
  return context;
}
