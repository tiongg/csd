import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import type { Notification } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bell, BellRing, Check, Trash2 } from 'lucide-react';
import { type PropsWithChildren, type ReactNode, useState } from 'react';
import { match } from 'ts-pattern';

dayjs.extend(relativeTime);

function getNotificationIcon(notification: Notification): ReactNode {
  const isTakenDownNotification =
    notification.type === 'COURSE_APPROVED' &&
    notification.title.toLowerCase().includes('taken down');

  if (isTakenDownNotification) {
    return <BellRing className="size-4 text-red-500" />;
  }

  const type = notification.type;
  return match(type)
    .with('CONTRIBUTOR_APPLIED', () => (
      <BellRing className="size-4 text-blue-500" />
    ))
    .with('COURSE_AWAITING_REVIEW', () => (
      <BellRing className="size-4 text-orange-500" />
    ))
    .with('TEAM_INVITATION', () => (
      <BellRing className="size-4 text-green-500" />
    ))
    .with('COURSE_APPROVED', () => (
      <BellRing className="size-4 text-emerald-500" />
    ))
    .exhaustive();
}

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  return (
    <div className="group relative flex gap-3 p-3">
      <div className="flex shrink-0 items-center justify-center">
        {getNotificationIcon(notification)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-900">
            {notification.title}
          </span>
          {!notification.isRead && (
            <div className="size-2 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="truncate text-xs text-slate-600">
          {notification.message}
        </p>
        <p className="text-xs text-slate-400">
          {dayjs(notification.createdAt).fromNow()}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.isRead && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Mark as read"
          >
            <Check className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          className="cursor-pointer rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete notification"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationsDropdown({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useApiQuery(
    'get',
    '/api/notifications/',
    {
      params: {
        query: { limit: 10, offset: 0 },
      },
    },
  );

  const { data: unreadData } = useApiQuery(
    'get',
    '/api/notifications/unread-count',
    {},
  );
  const unreadCount = unreadData?.count ?? 0;

  const { mutateAsync: markAsRead, isPending: isMarkingAsRead } =
    useApiMutation('patch', '/api/notifications/mark-read', {
      onSuccess: () => {
        queryClient.invalidateQueries(
          apiQueryOptions('get', '/api/notifications/'),
        );
        queryClient.invalidateQueries(
          apiQueryOptions('get', '/api/notifications/unread-count'),
        );
      },
    });

  const { mutateAsync: deleteNotification } = useApiMutation(
    'delete',
    '/api/notifications/{notificationId}',
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          apiQueryOptions('get', '/api/notifications/'),
        );
        queryClient.invalidateQueries(
          apiQueryOptions('get', '/api/notifications/unread-count'),
        );
      },
    },
  );

  function handleMarkAsRead(id: string) {
    return markAsRead({
      body: { notificationIds: [id] },
    });
  }

  function handleMarkAllAsRead() {
    return markAsRead({
      body: { notificationIds: [] },
    });
  }

  function handleDelete(notificationId: string) {
    return deleteNotification({
      params: {
        path: { notificationId },
      },
    });
  }

  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">
              Notifications
            </span>
          </div>
          {hasUnread && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
              disabled={isMarkingAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-slate-500">
              Loading...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <Bell className="size-8 text-slate-300" />
              <p className="text-sm text-slate-500">No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                  <div className="mx-3 border-b border-slate-100 last:hidden" />
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
