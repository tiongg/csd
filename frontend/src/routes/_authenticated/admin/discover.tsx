import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/discover')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/user-management' });
  },
  component: () => null,
});
