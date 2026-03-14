import type { SectionType } from '@/lib/content.type';
import type { ContentVersion, Course } from '@/lib/utils';
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

export type ContentReviewContextType = {
  course: Course;
  content: SectionType[];
  contentVersion: ContentVersion;
  currentSection: number;
  setCurrentSection: (section: number) => void;
};

const ContentReviewContext = createContext<ContentReviewContextType | null>(
  null,
);

type ContentReviewProviderProps = PropsWithChildren<{
  course: Course;
  content: SectionType[];
  contentVersion: ContentVersion;
  defaultSection?: number;
}>;

export function ContentReviewProvider({
  course,
  content,
  contentVersion,
  defaultSection = -1,
  children,
}: ContentReviewProviderProps) {
  const [currentSection, setCurrentSection] = useState(defaultSection);

  return (
    <ContentReviewContext.Provider
      value={{
        course,
        content,
        contentVersion,
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
