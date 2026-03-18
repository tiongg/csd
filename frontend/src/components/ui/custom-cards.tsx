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
  onInteract,
  ...rest
}: { title: string, onInteract: () => void } & ComponentProps<'div'>) {
  return (
    <button className="h-full w-full" onClick={onInteract}>
      <Card
        className={cn(
          'group h-full cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 py-0 text-left shadow-[0_10px_24px_-20px_rgba(15,23,42,0.7)] transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_20px_38px_-22px_rgba(14,116,144,0.55)]',
          className,
        )}
        {...rest}
      >
        <CardContent className="flex h-full min-h-56 flex-col items-start justify-between gap-y-6 p-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition-colors group-hover:bg-sky-600 group-hover:text-white">
            <PlusCircleIcon className="size-7" />
          </span>
          <div className="space-y-1">
            <Heading3 className="text-slate-900">{title}</Heading3>
            <p className="text-sm text-slate-600">
              Create a workspace and invite collaborators.
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

type CardWithDetailsProps = {
  title: string;
  descriptor: string;
  data: string;
  enableTooltip?: boolean;
  onInteract?: () => void;
} & ComponentProps<'div'>;

export function CardWithDetails({
  title,
  descriptor,
  data,
  children,
  enableTooltip = false,
  onInteract = () => {},
  className,
  ...rest
}: CardWithDetailsProps) {
  return (
    <button className="h-full w-full" onClick={onInteract}>
      <div
        className={cn(
          'group h-full flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_-20px_rgba(15,23,42,0.7)] transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_20px_38px_-22px_rgba(14,116,144,0.55)]',
          className,
        )}
        {...rest}
      >
        <div className="relative h-24 overflow-hidden bg-[linear-gradient(140deg,#eff6ff,#e2e8f0_62%,#cffafe)]">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/45" />
        </div>
        <Separator className="bg-slate-200" />
        <div className="flex items-end justify-between p-5">
          <div className="flex flex-col gap-1">
            <div className="group relative w-full">
              {enableTooltip && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-slate-800 px-2 py-1 text-sm whitespace-nowrap text-white opacity-0 shadow-md transition group-hover:opacity-100">
                  {title}
                </div>
              )}
              <Heading3 className="max-w-full truncate text-slate-900">
                {title}
              </Heading3>
            </div>
            <p className="text-sm font-medium text-slate-600">
              {descriptor}: {data}
            </p>
          </div>
          {children ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer text-slate-600 transition-colors hover:text-slate-800"
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
    </button>
  );
}
