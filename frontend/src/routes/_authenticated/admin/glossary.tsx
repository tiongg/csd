import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/glossary')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/user-management' });
  },
  component: () => null,
});
