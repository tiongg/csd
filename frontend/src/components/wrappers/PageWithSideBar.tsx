import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';
import Sidebar from '../Sidebar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

function SidebarSpacer() {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={cn(
        'shrink-0 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-70',
      )}
    />
  );
}

export default function PageWithSideBar({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <SidebarProvider>
      <div className={cn('relative flex min-h-[calc(100vh-52px)]', className)}>
        {/* Fixed sidebar rendered outside the flow */}
        <Sidebar />
        {/* Spacer that mirrors sidebar width — drives the smooth content shift */}
        <SidebarSpacer />
        {/* Content area fills remaining space, no hardcoded margins */}
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}