import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import CoursesList from '@/features/contributor/CoursesList';

export const Route = createFileRoute('/contributor/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWithSideBar>
      <CoursesList />
    </PageWithSideBar>
  )
}