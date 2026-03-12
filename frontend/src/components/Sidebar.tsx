import {
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
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { LinkOptions } from '@tanstack/react-router';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import type { Account } from '@/context/AuthContext';
import useActiveRole from '@/hooks/useActiveRole';
import { capitalizeFirst, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from './ui/sidebar';
import { ChevronUp } from 'lucide-react';

dayjs.extend(relativeTime);

async function getGravatarUrl(email: string, size = 40) {
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
  isCollapsed?: boolean;
}>;

function NavItem({ title, link, icon, children }: NavItemProps) {
  return (
    <div className="w-full">
      <Button
        variant="ghost"
        title={title}
        className={cn(
          'w-full cursor-pointer justify-start rounded-full text-slate-700 transition-all duration-300',
        )}
        asChild
      >
        <Link
          to={link}
          className="flex items-center gap-2 hover:bg-slate-50 [&.active]:bg-slate-100"
        >
          {icon && (
            <span className="flex size-5 shrink-0 items-center justify-center">
              {icon}
            </span>
          )}
          <span>{title}</span>
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
          icon={<RectangleGroupIcon className="size-5" />}
        />
        <NavItem
          title="User Management"
          link="/admin/user-management"
          icon={<UserIcon className="size-5" />}
        />
        <NavItem
          title="Course Moderation"
          link="/admin/course-moderation"
          icon={<DocumentTextIcon className="size-5" />}
        />
      </>
    ))
    .with([P.not('LEARNER'), 'CONTRIBUTOR'], () => (
      <>
        <NavItem
          title="Dashboard"
          link="/contributor/dashboard"
          icon={<RectangleGroupIcon className="size-5" />}
        />
        <NavItem
          title="Teams"
          link="/contributor/teams"
          icon={<UsersIcon className="size-5" />}
        />
      </>
    ))
    .otherwise(() => (
      <>
        <NavItem
          title="Dashboard"
          link="/learner/dashboard"
          icon={<RectangleGroupIcon className="size-5" />}
        />
        <NavItem
          title="Discover"
          link="/learner/discover"
          icon={<LightBulbIcon className="size-5" />}
        />
        <NavItem
          title="My Courses"
          link="/learner/my-courses"
          icon={<PencilSquareIcon className="size-5" />}
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

export default function Sidebar() {
  const currentActiveRole = useActiveRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [gravatarUrl, setGravatarUrl] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    getGravatarUrl(user.email).then((url) => setGravatarUrl(url));
  }, [user]);

  if (!user || !currentActiveRole) return null;

  return (
    <ShadcnSidebar>
      <SidebarHeader />
      <SidebarContent className="py-8">
        <SidebarGroup>
          <SidebarGroupLabel className="font-subtitle tracking-wider">
            MAIN MENU
          </SidebarGroupLabel>
          <SidebarMenu>
            <div className="flex flex-col gap-y-2">
              <SidebarByRole role={user.role} />
            </div>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-subtitle tracking-wider">
            SYSTEM
          </SidebarGroupLabel>
          <SidebarMenu>
            <div className="flex flex-col gap-y-2 py-4">
              <NavItem
                title="Settings"
                link={getRoleUrl(currentActiveRole, 'settings')}
                icon={<Cog6ToothIcon className="size-5" />}
                isCollapsed={false}
              />
              <NavItem
                title="Help & Support"
                link={getRoleUrl(currentActiveRole, 'faq')}
                icon={<QuestionMarkCircleIcon className="size-5" />}
                isCollapsed={false}
              />
            </div>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <img
                  src={gravatarUrl}
                  alt="Profile avatar"
                  className="size-10 shrink-0 rounded-full border-2 border-slate-300 transition-all hover:border-slate-500"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="10" stroke="%2394a3b8"/%3E%3Ccircle cx="12" cy="9" r="3" fill="%2394a3b8"/%3E%3Cpath d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" stroke="%2394a3b8"/%3E%3C/svg%3E';
                  }}
                />
                <div className="flex flex-col overflow-hidden p-2 text-left">
                  <div className="truncate text-sm font-bold text-slate-700">
                    @{user.username}
                  </div>
                  <div className="text-xs text-slate-500">
                    {capitalizeFirst(user.role)}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ChevronUp className="cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-50">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={async () => {
                      await logout();
                      navigate({ to: '/' });
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
