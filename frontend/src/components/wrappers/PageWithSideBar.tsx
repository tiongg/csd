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
      {children}
    </div>
  );
}
