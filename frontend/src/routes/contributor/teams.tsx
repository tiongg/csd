import { createFileRoute } from '@tanstack/react-router'
import PageWithSideBar from '@/components/wrappers/PageWithSideBar'
import TeamsList from '@/features/contributor/TeamsList'

export const Route = createFileRoute('/contributor/teams')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWithSideBar>
        <div className='h-[calc(100vh-52px)] w-full'>
            <TeamsList/>
        </div>
    </PageWithSideBar>
  )
}