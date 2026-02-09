import Sidebar from '../Sidebar';
import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export default function PageWithSideBar({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div className={cn('flex', className)}>
      <Sidebar />
      <div className='ml-70 w-full h-[calc(100vh-52px)]'>
        {children}
      </div>
    </div>
  );
}
