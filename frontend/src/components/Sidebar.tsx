import {
  BookOpenIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  RectangleGroupIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { P, match } from 'ts-pattern';
import { Button } from './ui/button';
import type { Account } from '@/context/AuthContext';
import type React from 'react';
import type { LinkOptions } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';

type NavItemProps = {
  title: string;
  link: LinkOptions["to"];
  icon?: React.ReactNode;
}

function NavItem({ title, link, icon }: NavItemProps) {
  return (
    <div className="py-2">
      <Button
        variant="ghost"
        className="cursor-pointer rounded-full text-slate-700"
      >
        {icon}
        <Link to={link}>{title}</Link>
      </Button>
    </div>
  );
}

function SidebarByRole({ role }: { role: Account['role'] }) {
  const location = useLocation();
  const dir = location.href.split('/')[1]?.toUpperCase() ?? 'LEARNER';

  return match([role, dir])
    .with(['ADMIN', 'ADMIN'], () => (
      <div>
        <NavItem
          title="Dashboard"
          link="/admin/dashboard"
          icon={<RectangleGroupIcon />}
        />

        <NavItem title="User Moderation" link="/" icon={<UserIcon />} />

        <NavItem
          title="Course Moderation"
          link="/"
          icon={<DocumentTextIcon />}
        />
      </div>
    ))
    .with([P.not('LEARNER'), 'CONTRIBUTOR'], () => (
      <div>
        <NavItem
          title="Dashboard"
          link="/contributor/dashboard"
          icon={<RectangleGroupIcon />}
        />

        <NavItem title="Teams" link="/" icon={<UsersIcon />} />

        <NavItem title="Courses" link="/" icon={<BookOpenIcon />} />
      </div>
    ))
    .otherwise(() => (
      <div>
        <NavItem
          title="Dashboard"
          link="/learner/dashboard"
          icon={<RectangleGroupIcon />}
        />
        <NavItem title="Challenges" link="/" icon={<TrophyIcon />} />
        <NavItem title="My Courses" link="/" icon={<PencilSquareIcon />} />
      </div>
    ));
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] w-1/6 min-w-50 flex-col justify-between bg-white/50 shadow-lg">
      <div>
        <div className="px-8 py-4">
          <p className="font-subtitle tracking-wider">MAIN MENU</p>

          <SidebarByRole role={user.role} />
        </div>

        <div className="px-8 py-4">
          <p className="font-subtitle tracking-wider">SYSTEM</p>

          <NavItem title="Settings" link="/" icon={<Cog6ToothIcon />} />
          <NavItem
            title="Help & Support"
            link="/"
            icon={<QuestionMarkCircleIcon />}
          />

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

        <div className="flex flex-col p-4">
          <div className="text-sm font-bold text-slate-700">
            {user.realname}
          </div>
          <div className="text-xs text-slate-500">
            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
