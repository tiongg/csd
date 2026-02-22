import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';
import Sidebar from '../Sidebar';

export default function PageWithSideBar({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div className={cn('flex', className)}>
      <Sidebar />
      <div className="min-h-[calc(100vh-52px)] w-full overflow-hidden pl-70">
        {children}
      </div>
    </div>
  );
}
