import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Account } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import useActiveRole from '@/hooks/useActiveRole';
import type { LinkOptions } from '@tanstack/react-router';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { ChevronDown, UserCircle2 } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
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
      { label: 'User Management', to: '/admin/user-management' as const },
      { label: 'Course Moderation', to: '/admin/course-moderation' as const },
      { label: 'Glossary', to: '/admin/glossary' as const },
      { label: 'Desmos', to: '/admin/desmos' as const },
    ])
    .with('CONTRIBUTOR', () => [
      { label: 'Dashboard', to: '/contributor/dashboard' as const },
      { label: 'Workspace', to: '/contributor/teams' as const },
      { label: 'Glossary', to: '/contributor/glossary' as const },
      { label: 'Desmos', to: '/contributor/desmos' as const },
    ])
    .with('LEARNER', () => [
      { label: 'Dashboard', to: '/learner/dashboard' as const },
      { label: 'Discover', to: '/learner/discover' as const },
      { label: 'My Courses', to: '/learner/my-courses' as const },
      { label: 'Glossary', to: '/learner/glossary' as const },
      { label: 'Desmos', to: '/learner/desmos' as const },
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

function isPrimaryNavItemActive(
  item: PrimaryNavItem,
  pathname: string,
  role: Account['role'],
) {
  const to = String(item.to);

  if (role === 'ADMIN' && to === '/admin/course-moderation') {
    return (
      pathname === to ||
      pathname.startsWith(`${to}/`) ||
      pathname.startsWith('/admin/review')
    );
  }

  if (role === 'CONTRIBUTOR' && to === '/contributor/teams') {
    const contributorWorkspacePaths = [
      '/contributor/teams',
      '/contributor/editor/',
      '/contributor/',
    ];
    const contributorExcludedPaths = [
      '/contributor/dashboard',
      '/contributor/glossary',
      '/contributor/desmos',
      '/contributor/settings',
      '/contributor/faq',
    ];

    const isExcluded = contributorExcludedPaths.some((path) =>
      pathname.startsWith(path),
    );
    if (isExcluded) {
      return false;
    }

    return contributorWorkspacePaths.some((path) =>
      path === '/contributor/'
        ? /^\/contributor\/[^/]+\/courses(?:\/|$)/.test(pathname)
        : pathname.startsWith(path),
    );
  }

  if (role === 'LEARNER' && to === '/learner/my-courses') {
    return (
      pathname === to ||
      pathname.startsWith(`${to}/`) ||
      pathname.startsWith('/learner/courses/')
    );
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [activePill, setActivePill] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const navTrackRef = useRef<HTMLDivElement | null>(null);
  const dir = useActiveRole() ?? '';
  const activeRole: Account['role'] = user?.role ?? 'LEARNER';
  const navRole = (dir || activeRole) as Account['role'];
  const primaryNavItems = getPrimaryNavItems(navRole);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const updateActivePill = () => {
      const navTrack = navTrackRef.current;
      if (!navTrack) return;

      const activeLink = navTrack.querySelector(
        'a[data-nav-active="true"]',
      ) as HTMLElement | null;
      if (!activeLink) {
        setActivePill((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const navRect = navTrack.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      setActivePill({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        opacity: 1,
      });
    };

    updateActivePill();
    const rafId = window.requestAnimationFrame(updateActivePill);
    window.addEventListener('resize', updateActivePill);

    const resizeObserver = new ResizeObserver(updateActivePill);
    if (navTrackRef.current) {
      resizeObserver.observe(navTrackRef.current);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateActivePill);
      resizeObserver.disconnect();
    };
  }, [pathname, navRole, primaryNavItems.length]);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-slate-300/85 bg-slate-100/86 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.28)] backdrop-blur-xl [backdrop-filter:saturate(115%)_blur(10px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent"
      />
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            className="flex items-center gap-x-3 rounded-full px-2 py-1 transition-colors hover:bg-white/70"
            to="/"
          >
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
          <nav className="hidden flex-1 items-center justify-center lg:flex">
            <div
              ref={navTrackRef}
              className="relative inline-flex items-center gap-1 rounded-full border border-transparent bg-white/30 p-1 shadow-none backdrop-blur-xl"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-1 bottom-1 rounded-full border border-stone-400/45 bg-gradient-to-b from-white/92 via-slate-100/75 to-stone-200/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.38),0_10px_24px_-12px_rgba(51,65,85,0.42)] backdrop-blur-2xl transition-[left,width,opacity] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: `${activePill.width}px`,
                  opacity: activePill.opacity,
                  left: `${activePill.left}px`,
                }}
              />
              {primaryNavItems.map((item) => {
                const isActive = isPrimaryNavItemActive(item, pathname, navRole);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    data-nav-active={isActive ? 'true' : 'false'}
                    className={cn(
                      'relative z-10 inline-flex items-center justify-center rounded-full border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-300 hover:text-slate-900 [&.active]:text-slate-900',
                      isActive && 'active text-slate-900',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
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
                    className="flex h-9 min-w-26 items-center justify-between gap-1.5 rounded-full border border-stone-300/55 bg-gradient-to-b from-white/72 via-white/48 to-stone-100/42 px-3 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.32),0_8px_18px_-14px_rgba(51,65,85,0.35)] backdrop-blur-xl transition-colors duration-200 hover:border-stone-400/65 hover:from-white/80 hover:to-stone-100/50"
                  >
                    <span>
                      {match(navRole)
                        .with('ADMIN', () => 'Admin')
                        .with('CONTRIBUTOR', () => 'Contributor')
                        .with('LEARNER', () => 'Learner')
                        .exhaustive()}
                    </span>
                    <ChevronDown
                      className={`size-4 text-slate-500 transition-transform ${
                        roleMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/user-management" className="w-full">
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
                  className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-stone-300/55 bg-gradient-to-b from-white/72 via-white/48 to-stone-100/42 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.32),0_8px_18px_-14px_rgba(51,65,85,0.35)] backdrop-blur-xl transition-colors duration-200 hover:border-stone-400/65 hover:from-white/80 hover:to-stone-100/50"
                  aria-label="Account menu"
                >
                  {(user as Account & { profilePictureUrl?: string })
                    .profilePictureUrl ? (
                    <img
                      src={
                        (user as Account & { profilePictureUrl?: string })
                          .profilePictureUrl
                      }
                      alt={user.username}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserCircle2 className="size-6" />
                  )}
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
