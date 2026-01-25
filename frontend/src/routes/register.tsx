import RegistrationForm from '@/features/profile/registration/RegistrationForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <RegistrationForm />
    </div>
  );
}
