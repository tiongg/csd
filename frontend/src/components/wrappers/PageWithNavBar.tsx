import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export default function PageWithNavBar({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <main className={cn('w-full', className)}>{children}</main>;
}

