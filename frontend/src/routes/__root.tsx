import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import Navbar from '../components/Navbar';

import { type AuthContextType } from '@/context/AuthContext';
import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContextType;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <main className="flex min-h-dvh w-full flex-col">
      <Navbar />
      <Outlet />
    </main>
  ),
});
