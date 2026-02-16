import type { Account } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import useActiveRole from '@/hooks/useActiveRole';
import { capitalizeFirst } from '@/lib/utils';
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  RectangleGroupIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import type { LinkOptions } from '@tanstack/react-router';
import { Link, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { P, match } from 'ts-pattern';
import { Button } from './ui/button';

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
        >
          <div className="absolute right-10 rounded-full bg-rose-500 px-3 text-white">
            4
          </div>
        </NavItem>

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
          title="Challenges"
          link="/learner/challenges"
          icon={<TrophyIcon />}
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

export default function Sidebar() {
  const currentActiveRole = useActiveRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || !currentActiveRole) {
    return null;
  }

  return (
    <div className="fixed flex h-[calc(100vh-3rem)] w-70 flex-col justify-between bg-white/50 shadow-lg">
      <div>
        <div className="px-8 py-4">
          <p className="font-subtitle tracking-wider">MAIN MENU</p>
          <div className="flex flex-col gap-y-4 py-4">
            <SidebarByRole role={user.role} />
          </div>
        </div>

        <div className="px-8 py-4">
          <p className="font-subtitle tracking-wider">SYSTEM</p>

          <div className="flex flex-col gap-y-4 py-4">
            <NavItem
              title="Settings"
              link={getRoleUrl(currentActiveRole,'settings')}
              icon={<Cog6ToothIcon />}
            />

            <NavItem
              title="Help & Support"
              link={getRoleUrl(currentActiveRole,'faq')}
              icon={<QuestionMarkCircleIcon />}
            />
          </div>

          <Button
            variant="default"
            onClick={async () => {
              await logout();
              navigate({ to: '/' });
            }}
            className="my-2 w-full cursor-pointer"
          >
            Log out
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-around border-t-2 border-t-slate-300 px-4 py-1">
        <div className="aspect-square size-10 rounded-full bg-sky-600"></div>

        <div className="flex flex-col p-4 text-center">
          <div className="text-sm font-bold text-slate-700">
            @{user.username}
          </div>
          <div className="text-xs text-slate-500">
            {capitalizeFirst(user.role)}
          </div>
        </div>
      </div>
    </div>
  );
}
