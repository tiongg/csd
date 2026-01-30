import UpdateProfileForm from '@/features/profile/edit/UpdateProfileForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <UpdateProfileForm />
    </div>
  );
}
