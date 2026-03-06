import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isLoggedIn) {
      throw redirect({ to: '/login' });
    }
    if (context.auth.preferences?.length === 0) {
      throw redirect({ to: '/preference' });
    }
  },

  component: () => <Outlet />,
});
