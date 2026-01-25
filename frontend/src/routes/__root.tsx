import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import Navbar from '../components/Navbar';

import { AuthProvider } from '@/context/AuthContext';
import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AuthProvider>
      <main className="flex min-h-dvh w-screen flex-col">
        <Navbar />
        <Outlet />
      </main>
    </AuthProvider>
  ),
});
