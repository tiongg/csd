import LoginForm from '@/features/auth/LoginForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-[calc(100vh-52px)] flex justify-center">
      <LoginForm />
    </div>
  );
}
