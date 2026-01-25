import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import Header from '../components/Header';

import { AuthProvider } from '@/context/AuthContext';
import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AuthProvider>
      <main className="flex min-h-dvh w-screen flex-col">
        <Header />
        <Outlet />
      </main>
    </AuthProvider>
  ),
});
