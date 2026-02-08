import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import ChallengesPage from '@/features/learner/ChallengesPage';

export const Route = createFileRoute('/learner/challenges')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <PageWithSideBar>
            <div className='h-[calc(100vh-52px)] w-full'>
                <ChallengesPage/>
            </div>
        </PageWithSideBar>
    );
}
