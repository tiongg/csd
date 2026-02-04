import { Link, useLocation } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { capitalizeFirst } from '@/lib/utils';

export default function Navbar() {
  const { user } = useAuth();
  const [navClicked, setNavClicked] = useState(false);
  const location = useLocation();
  const dir = location.href.split('/')[1]?.toUpperCase() ?? 'LEARNER';

  return (
    <header className="flex w-full items-center justify-between bg-white/50 p-2 px-8 shadow-lg">
      {/* Logo placeholder */}
      <Link className="aspect-square size-8 rounded-full bg-sky-600" to="/" />

      {!user ? (
        <div>
          <Button className="mx-2 rounded-full" variant="outline">
            <Link to="/login">Log In</Link>
          </Button>
          <Button className="mx-2 rounded-full">
            <Link to="/register">Sign Up</Link>
          </Button>
        </div>
      ) : (
        user.role !== 'LEARNER' && (
          <DropdownMenu onOpenChange={setNavClicked}>
            <DropdownMenuTrigger asChild>
              <div className="flex h-7.5 w-40 cursor-pointer items-center justify-between rounded border bg-white px-4 py-1">
                <span>
                  {capitalizeFirst(dir)}
                </span>
                {navClicked ? (
                  <div className="ml-8 inline-block h-0 w-0 border-r-8 border-b-5 border-l-8 border-r-transparent border-b-slate-400 border-l-transparent">
                    <span className="sr-only">Dropdown</span>
                  </div>
                ) : (
                  <div className="ml-8 inline-block h-0 w-0 border-t-5 border-r-8 border-l-8 border-t-slate-400 border-r-transparent border-l-transparent">
                    <span className="sr-only">Dropdown</span>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {user.role === 'ADMIN' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard" className="w-full text-sky-900">
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link
                  to="/contributor/dashboard"
                  className="w-full text-sky-900"
                >
                  Contributor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/learner/dashboard" className="w-full text-sky-900">
                  Learner
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      )}
    </header>
  );
}
