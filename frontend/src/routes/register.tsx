import RegistrationForm from '@/features/profile/registration/RegistrationForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex h-[calc(100vh-52px)] items-center justify-center bg-[radial-gradient(circle_at_top,_#ffffff,_#e2e8f0_48%,_#cbd5e1)] p-4 md:p-8">
      <RegistrationForm />
    </div>
  );
}
