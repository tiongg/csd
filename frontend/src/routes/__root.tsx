import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import Navbar from '../components/Navbar';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
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
      <TooltipProvider>
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </TooltipProvider>
      <Toaster />
    </main>
  ),
});
