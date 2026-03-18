import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export default function PageWithNavBar({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <main className={cn('min-h-screen w-full bg-slate-50/80', className)}>
      {children}
    </main>
  );
}
