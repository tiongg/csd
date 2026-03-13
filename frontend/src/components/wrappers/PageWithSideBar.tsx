import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';
import Sidebar from '../Sidebar';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';

export default function PageWithSideBar({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <SidebarProvider defaultOpen>
      <div className={cn('absolute flex w-full', className)}>
        <Sidebar />

        <main className="min-w-0 flex-1">
          <SidebarTrigger className="sticky top-16 p-6" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
