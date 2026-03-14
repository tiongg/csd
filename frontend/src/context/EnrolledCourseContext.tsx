import { useApiQuery } from '@/lib/fetch-client';
import type { EnrolledCourse } from '@/lib/utils';
import { createContext, useContext, type PropsWithChildren } from 'react';

type EnrolledCourseContextType = {
  enrolledCourses: EnrolledCourse[];
};

const EnrolledCourseContext = createContext<
  EnrolledCourseContextType | undefined
>(undefined);

export function EnrolledCourseProvider({ children }: PropsWithChildren) {
  const { data: enrolledCourses } = useApiQuery(
    'get',
    '/api/learner/lesson/enrolled',
  );

  return (
    <EnrolledCourseContext.Provider
      value={{
        enrolledCourses: enrolledCourses?.enrolledLessons ?? [],
      }}
    >
      {children}
    </EnrolledCourseContext.Provider>
  );
}

export default function useEnrolledCourse() {
  const context = useContext(EnrolledCourseContext);
  if (!context) {
    throw new Error(
      'useEnrolledCourse must be used within a EnrolledCourseProvider',
    );
  }
  return context;
}
