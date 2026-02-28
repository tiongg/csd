import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';
import Sidebar from '../Sidebar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

/**
 * ROOT CAUSE (Issue 3):
 * The old PageContent used `pl-16` / `pl-70` Tailwind class swaps to offset content.
 * Class swaps are instantaneous — there is no CSS transition on padding, so the
 * content "jumps" rather than sliding. The sidebar itself transitions via
 * `transition-all duration-300`, but the content area never followed.
 *
 * FIX:
 * Use a flex row layout. A zero-content <SidebarSpacer /> div occupies exactly
 * the same width as the fixed sidebar and carries the `transition-all duration-300`
 * class so it shrinks/grows in sync with the sidebar. The content area sits in
 * `flex-1 min-w-0` and naturally fills whatever space remains — no hardcoded
 * margins or padding required.
 */

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