import RegistrationForm from '@/features/profile/registration/RegistrationForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex h-[calc(100vh-52px)] justify-center">
      <RegistrationForm />
    </div>
  );
}
