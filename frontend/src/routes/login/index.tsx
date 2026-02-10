import LoginForm from '@/features/auth/LoginForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-[calc(100vh-52px)] justify-center">
      <LoginForm />
    </div>
  );
}
