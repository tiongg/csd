import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import ChallengesPage from '@/features/learner/ChallengesPage';

export const Route = createFileRoute('/learner/challenges')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <PageWithSideBar>
            <ChallengesPage/>
        </PageWithSideBar>
    );
}
