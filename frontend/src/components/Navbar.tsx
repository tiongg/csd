import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [navClicked, setNavClicked] = useState(false);

  return (
    <header className="flex items-center justify-between bg-white p-2 px-8 shadow-lg">
      {/* Logo placeholder */}
      <Link
        className="aspect-square size-8 rounded-full bg-sky-600"
        to="/"
      />

      {user ? (
        <DropdownMenu onOpenChange={setNavClicked}>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center justify-center rounded bg-white border py-1 px-4">
              {
                user.role !== "LEARNER" ? (
                  <span>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                  </span>
                ) : (
                  <Link to="/learner/dashboard" className="w-full text-sky-900">Learner</Link>
                )
              }
              {
                user.role !== "LEARNER" ?
                  (
                    navClicked ? (
                      <div className='inline-block w-0 h-0 border-l-8 border-r-8 border-l-transparent border-r-transparent border-b-5 border-b-slate-400 ml-8'>
                        <span className='sr-only'>Dropdown</span>
                      </div>
                    ) : (
                      <div className='inline-block w-0 h-0 border-l-8 border-r-8 border-l-transparent border-r-transparent border-t-5 border-t-slate-400 ml-8'>
                        <span className='sr-only'>Dropdown</span>
                      </div>
                    )
                  ) : null
              }

            </div>
          </DropdownMenuTrigger>
          {
            user.role !== "LEARNER" ? (
              <DropdownMenuContent>
                {
                  user.role === "ADMIN" ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="w-full text-sky-900">
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  ) : null
                }
                {
                  user.role === "ADMIN" || user.role === "CONTRIBUTOR" ? (
                    <DropdownMenuItem asChild>
                      <Link to="/contributor/dashboard" className="w-full text-sky-900">
                        Contributor
                      </Link>
                    </DropdownMenuItem>
                  ) : null
                }
                <DropdownMenuItem asChild>
                  <Link to="/learner/dashboard" className="w-full text-sky-900">
                    Learner
                  </Link>
                </DropdownMenuItem>


                {/* to clean up later */}
                {/* <DropdownMenuItem asChild>
              <Link to="/profile" className="w-full text-sky-900">
                My Account
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator /> */}

                {/* <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    navigate({ to: '/' });
                  }}
                  asChild
                >
                  <span className='text-sky-900'>Logout</span>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            ) : null
          }
        </DropdownMenu>
      ) : (
        <div>
          <Button className='rounded-full mx-2' variant="outline">
            <Link to="/login">Log In</Link>
          </Button>
          <Button className='rounded-full mx-2'>
            <Link to="/register">Sign Up</Link>
          </Button>
        </div>
      )}
      {/* also to clean up later */}
      {/* <button onClick={async () => {
        await logout();
        navigate({ to: '/' });
      }}>logout temp</button> */}
    </header>
  );
}
