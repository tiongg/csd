import { Badge } from '@/components/ui/badge';
import { useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import type { ComponentProps } from 'react';

type NotificationBellProps = ComponentProps<'button'>;

export default function NotificationBell({
  className,
  ...props
}: NotificationBellProps) {
  const { data: unreadCount } = useApiQuery(
    'get',
    '/api/notifications/unread-count',
  );

  return (
    <button
      type="button"
      className={cn(
        'relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100',
        className,
      )}
      aria-label="Notifications"
      {...props}
    >
      <Bell className="size-5" />
      {(unreadCount?.count ?? 0) > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-xs"
        >
          {(unreadCount?.count ?? 0) > 9 ? '9+' : unreadCount?.count}
        </Badge>
      )}
    </button>
  );
}
