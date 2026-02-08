import { createFileRoute } from '@tanstack/react-router'
import PageWithSideBar from '@/components/wrappers/PageWithSideBar'
import CourseModerationForm from '@/features/admin/CourseModerationForm'

export const Route = createFileRoute('/admin/course-moderation')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWithSideBar>
        <div className='h-[calc(100vh-52px)] w-full'>
            <CourseModerationForm/>
        </div>
    </PageWithSideBar>
  )
}
