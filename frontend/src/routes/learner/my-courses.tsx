import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import MyCoursesPage from '@/features/learner/MyCoursesPage';


export const Route = createFileRoute('/learner/my-courses')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <PageWithSideBar>
            <div className='h-[calc(100vh-52px)] w-full'>
                <MyCoursesPage/>
            </div>
        </PageWithSideBar>
    );
}
