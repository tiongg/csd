import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@tanstack/react-router';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-gray-800 p-2 px-8 text-white shadow-lg">
      {/* Logo placeholder */}
      <Link
        className="aspect-square size-8 rounded-full bg-violet-400"
        to="/"
      />

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex aspect-square size-8 cursor-pointer items-center justify-center rounded-full bg-white text-black">
              {user.username.at(0)?.toUpperCase()}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/profile" className="w-full">
                My Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </header>
  );
}
