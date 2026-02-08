import { createFileRoute } from '@tanstack/react-router'
import PageWithSideBar from '@/components/wrappers/PageWithSideBar'
import UserManagementForm from '@/features/admin/UserManagementForm'

export const Route = createFileRoute('/admin/user-management')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWithSideBar>
        <div className='h-[calc(100vh-52px)] w-full'>
            <UserManagementForm/>
        </div>
    </PageWithSideBar>
  )
}
