import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Account } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import useActiveRole from '@/hooks/useActiveRole';
import type { LinkOptions } from '@tanstack/react-router';
import { Link, useNavigate } from '@tanstack/react-router';
import { UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import { match } from 'ts-pattern';
import NotificationBell from './notifications/NotificationBell';
import NotificationsDropdown from './notifications/NotificationsDropdown';
import { Button } from './ui/button';

type PathType = 'settings' | 'faq';
type PrimaryNavItem = { label: string; to: LinkOptions['to'] };

function getPrimaryNavItems(
  currentActiveRole: Account['role'],
): PrimaryNavItem[] {
  return match(currentActiveRole)
    .with('ADMIN', () => [
      { label: 'Dashboard', to: '/admin/dashboard' as const },
      { label: 'Discover', to: '/admin/discover' as const },
      { label: 'User Management', to: '/admin/user-management' as const },
      { label: 'Course Moderation', to: '/admin/course-moderation' as const },
      { label: 'Glossary', to: '/admin/glossary' as const },
    ])
    .with('CONTRIBUTOR', () => [
      { label: 'Dashboard', to: '/contributor/dashboard' as const },
      { label: 'Discover', to: '/contributor/discover' as const },
      { label: 'Teams', to: '/contributor/teams' as const },
      { label: 'Glossary', to: '/contributor/glossary' as const },
    ])
    .with('LEARNER', () => [
      { label: 'Dashboard', to: '/learner/dashboard' as const },
      { label: 'Discover', to: '/learner/discover' as const },
      { label: 'My Courses', to: '/learner/my-courses' as const },
      { label: 'Glossary', to: '/learner/glossary' as const },
    ])
    .exhaustive();
}

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

export default function Navbar() {
  const { user, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const dir = useActiveRole() ?? '';
  const activeRole: Account['role'] = user?.role ?? 'LEARNER';
  const navRole = (dir || activeRole) as Account['role'];
  const primaryNavItems = getPrimaryNavItems(navRole);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link className="flex items-center gap-x-3" to="/">
            <img
              src="/assets/logo.jpg"
              alt="six seven logo"
              className="aspect-square size-8 rounded-full"
            />
            <div className="truncate font-[Noto_Sans] text-xl font-semibold text-slate-900 italic">
              The Six Seven
            </div>
          </Link>
        </div>

        {user ? (
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {primaryNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 [&.active]:bg-slate-100 [&.active]:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="hidden flex-1 lg:block" />
        )}

        {!user ? (
          <div className="ml-auto flex items-center justify-end gap-2">
            <Button className="rounded-lg px-4" variant="outline" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button className="rounded-lg px-4" asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        ) : (
          <div className="ml-auto flex items-center justify-end gap-2">
            {user.role !== 'LEARNER' && (
              <DropdownMenu onOpenChange={setRoleMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 min-w-26 items-center justify-between gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <span>
                      {match(navRole)
                        .with('ADMIN', () => 'Admin')
                        .with('CONTRIBUTOR', () => 'Contributor')
                        .with('LEARNER', () => 'Learner')
                        .exhaustive()}
                    </span>
                    <span
                      className={`text-slate-500 transition-transform ${
                        roleMenuOpen ? 'rotate-180' : ''
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="w-full">
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/contributor/dashboard" className="w-full">
                      Contributor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/learner/dashboard" className="w-full">
                      Learner
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <NotificationsDropdown>
              <NotificationBell />
            </NotificationsDropdown>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Account menu"
                >
                  <UserCircle2 className="size-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs text-slate-500">
                  @{user.username}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={getRoleUrl(navRole, 'settings')} className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={getRoleUrl(navRole, 'faq')} className="w-full">
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
        )}
      </div>
    </header>
  );
}
