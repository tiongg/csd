import RegistrationForm from '@/features/profile/registration/RegistrationForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="relative flex h-[calc(100vh-52px)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#ffffff,_#f8fafc_42%,_#e2e8f0)] p-4 md:p-8">
      <RegistrationForm />
    </div>
  );
}
