import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  LightBulbIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  RectangleGroupIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from '@tanstack/react-router';
import { P, match } from 'ts-pattern';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { LinkOptions } from '@tanstack/react-router';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import type { Account } from '@/context/AuthContext';
import useActiveRole from '@/hooks/useActiveRole';
import { capitalizeFirst, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

async function getGravatarUrl(email: string, size = 40) {
  // SHA-256 hash
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedEmail = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `https://www.gravatar.com/avatar/${hashedEmail}?s=${size}&d=identicon`;
}

type NavItemProps = PropsWithChildren<{
  title: string;
  link: LinkOptions['to'];
  icon?: React.ReactNode;
}>;

function NavItem({ title, link, icon, children }: NavItemProps) {
  return (
    <div className="w-full">
      <Button
        variant="ghost"
        className="w-full cursor-pointer justify-start rounded-full text-slate-700"
        asChild
      >
        <Link
          to={link}
          className="flex hover:bg-slate-50 [&.active]:bg-slate-100"
        >
          {icon}
          {title}
          {children}
        </Link>
      </Button>
    </div>
  );
}

function SidebarByRole({ role }: { role: Account['role'] }) {
  const dir = useActiveRole();
  return match([role, dir])
    .with(['ADMIN', 'ADMIN'], () => (
      <>
        <NavItem
          title="Dashboard"
          link="/admin/dashboard"
          icon={<RectangleGroupIcon />}
        />

        <NavItem
          title="User Management"
          link="/admin/user-management"
          icon={<UserIcon />}
        />

        <NavItem
          title="Course Moderation"
          link="/admin/course-moderation"
          icon={<DocumentTextIcon />}
        />
      </>
    ))
    .with([P.not('LEARNER'), 'CONTRIBUTOR'], () => (
      <>
        <NavItem
          title="Dashboard"
          link="/contributor/dashboard"
          icon={<RectangleGroupIcon />}
        />

        <NavItem title="Teams" link="/contributor/teams" icon={<UsersIcon />} />
      </>
    ))
    .otherwise(() => (
      <>
        <NavItem
          title="Dashboard"
          link="/learner/dashboard"
          icon={<RectangleGroupIcon />}
        />
        <NavItem
          title="Discover"
          link="/learner/discover"
          icon={<LightBulbIcon />}
        />
        <NavItem
          title="My Courses"
          link="/learner/my-courses"
          icon={<PencilSquareIcon />}
        />
      </>
    ));
}

type PathType = 'settings' | 'faq';
function getRoleUrl(
  currentActiveRole: Account['role'],
  path: PathType,
): LinkOptions['to'] {
  return match(currentActiveRole)
    .with('LEARNER', () => `/learner/${path}` as const)
    .with('ADMIN', () => `/admin/${path}` as const)
    .with('CONTRIBUTOR', () => `/contributor/${path}` as const)
    .exhaustive();
}

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  link?: string;
};

function NotificationPanel({ role }: { role: Account['role'] }) {
  const { data: pendingContributors } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {},
  );
  const { data: courses } = useApiQuery('get', '/api/courses', {});

  const notifications: Notification[] = match(role)
    .with('ADMIN', () => {
      const pendingApps = pendingContributors ?? [];
      return [
        ...pendingApps.map((app, index) => ({
          id: `contrib-app-${index}`,
          title: 'New Contributor Application',
          message: `${app.username} applied to become a contributor`,
          time: app.createdAt ?? dayjs().format(),
          type: 'warning' as const,
          link: '/admin/user-management',
        })),
      ];
    })
    .with('CONTRIBUTOR', () => {
      const pendingCourses = (courses ?? []).filter((c) => c.status === 'PENDING');
      return [
        ...pendingCourses.map((course, index) => ({
          id: `course-${course.id}`,
          title: 'Course Awaiting Approval',
          message: `${course.title} is pending review`,
          time: course.updatedAt ?? dayjs().format(),
          type: 'info' as const,
        })),
      ];
    })
    .with('LEARNER', () => {
      return [
        {
          id: 'welcome-1',
          title: 'Welcome!',
          message: 'Start exploring our courses',
          time: dayjs().format(),
          type: 'success' as const,
          link: '/learner/discover',
        },
      ];
    })
    .exhaustive();

  const notificationCount = notifications.length;

  if (notificationCount === 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
          >
            <BellIcon className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>No Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-4 text-center text-sm text-slate-500">
            You're all caught up!
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'text-amber-500';
      case 'success':
        return 'text-green-500';
      case 'danger':
        return 'text-rose-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer relative"
        >
          <BellIcon className="size-5" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>
          Notifications ({notificationCount})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            asChild
            className="flex-col items-start gap-1 p-3"
          >
            {notification.link ? (
              <Link to={notification.link}>
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BellIcon
                        className={cn('size-4', getTypeColor(notification.type))}
                      />
                      <span className="font-semibold text-slate-700">
                        {notification.title}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{notification.message}</p>
                    <p className="text-xs text-slate-400">
                      {dayjs(notification.time).fromNow()}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex w-full items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <BellIcon
                      className={cn('size-4', getTypeColor(notification.type))}
                    />
                    <span className="font-semibold text-slate-700">
                      {notification.title}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{notification.message}</p>
                  <p className="text-xs text-slate-400">
                    {dayjs(notification.time).fromNow()}
                  </p>
                </div>
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Sidebar() {
  const currentActiveRole = useActiveRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [gravatarUrl, setGravatarUrl] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      return;
    }
    getGravatarUrl(user.email).then((url) => setGravatarUrl(url));
  }, [user]);

  if (!user || !currentActiveRole) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed flex h-[calc(100vh-3rem)] flex-col justify-between bg-white/50 shadow-lg transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-70'
      )}
    >
      <div>
        <div className="flex items-center justify-between px-4 py-4">
          {!isCollapsed && (
            <p className="font-subtitle tracking-wider">MAIN MENU</p>
          )}
          <div className="flex items-center gap-2">
            {!isCollapsed && <NotificationPanel role={currentActiveRole} />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="cursor-pointer"
            >
              <Bars3Icon className="size-5" />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="px-8 py-4">
              <div className="flex flex-col gap-y-4 py-4">
                <SidebarByRole role={user.role} />
              </div>
            </div>

            <div className="px-8 py-4">
              <p className="font-subtitle tracking-wider">SYSTEM</p>

              <div className="flex flex-col gap-y-4 py-4">
                <NavItem
                  title="Settings"
                  link={getRoleUrl(currentActiveRole, 'settings')}
                  icon={<Cog6ToothIcon />}
                />

                <NavItem
                  title="Help & Support"
                  link={getRoleUrl(currentActiveRole, 'faq')}
                  icon={<QuestionMarkCircleIcon />}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-around border-t-2 border-t-slate-300 px-4 py-1">
        <Link
          to={getRoleUrl(currentActiveRole, 'settings')}
          className={cn(
            'flex items-center gap-2 transition-colors',
            isCollapsed ? 'w-full justify-center' : 'w-full'
          )}
        >
          <img
            src={gravatarUrl}
            alt="Profile avatar"
            className="size-10 rounded-full border-2 border-slate-300 hover:border-slate-500 transition-colors"
            onError={(e) => {
              // Fallback to a placeholder icon if Gravatar fails to load
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="10" stroke="%2394a3b8"/%3E%3Ccircle cx="12" cy="9" r="3" fill="%2394a3b8"/%3E%3Cpath d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" stroke="%2394a3b8"/%3E%3C/svg%3E';
            }}
          />

          {!isCollapsed && (
            <div className="flex flex-col p-4 text-left">
              <div className="text-sm font-bold text-slate-700">
                @{user.username}
              </div>
              <div className="text-xs text-slate-500">
                {capitalizeFirst(user.role)}
              </div>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
