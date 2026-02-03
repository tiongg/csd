import { createFileRoute } from '@tanstack/react-router'
import Sidebar from '@/components/Sidebar'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex'>
      <Sidebar />
      <div className='pt-16'>
        Hello "/admin/dashboard"!
      </div>
    </div>
  )
}
