import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  EllipsisVerticalIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import type { ComponentProps } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Separator } from './separator';
import { Heading3 } from './typography';

export function CardWithPlusIcon({
  title,
  className,
  ...rest
}: { title: string } & ComponentProps<'div'>) {
  return (
    <Card
      className={cn(
        'col-span-1 cursor-pointer border-2 transition hover:border-slate-500 hover:shadow-lg',
        className,
      )}
      {...rest}
    >
      <CardContent className="flex h-full flex-col items-center justify-center gap-y-8">
        <PlusCircleIcon className="size-28" />
        <Heading3>{title}</Heading3>
      </CardContent>
    </Card>
  );
}

type CardWithDetailsProps = {
  title: string;
  descriptor: string;
  data: string;
  enableTooltip?: boolean;
} & ComponentProps<'div'>;

export function CardWithDetails({
  title,
  descriptor,
  data,
  children,
  enableTooltip = false,
  className,
  ...rest
}: CardWithDetailsProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 transition-all hover:border-slate-500 hover:shadow-lg',
        className,
      )}
      {...rest}
    >
      <div className="h-40 bg-sky-200" />
      <Separator />
      <div className="flex items-end justify-between p-4">
        <div className="flex flex-col gap-1">
          <div className="group relative">
           {enableTooltip && <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-slate-800 px-2 py-1 text-sm whitespace-nowrap text-white opacity-0 shadow-md transition group-hover:opacity-100">
              {title}
            </div>}
            <Heading3 className="max-w-full truncate">{title}</Heading3>
          </div>
          <p className="text-sm text-slate-600">
            {descriptor}: {data}
          </p>
        </div>
        {children ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="cursor-pointer text-slate-600 hover:text-slate-800 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVerticalIcon className="size-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {children}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}
