import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { P, match } from "ts-pattern";
import { Button } from "./ui/button";
import type { Account } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';

interface NavItemProps {
    title: string;
    link: string;
}

function NavItem({ title, link }: NavItemProps) {
    return (
        <div className="py-2">
            <Button variant="ghost" className="rounded-full cursor-pointer text-slate-700">
                <Link to={link}>
                    {title}
                </Link>
            </Button>
        </div>
    )
}

function SidebarByRole({ role }: { role: Account['role'] }) {
    const location = useLocation();
    const dir = location.href.split("/")[1]?.toUpperCase() ?? "LEARNER";

    return match([role, dir])
        .with(["ADMIN", "ADMIN"], () =>
            <div>
                <NavItem title="Dashboard" link="/admin/dashboard" />

                <NavItem title="User Moderation" link="" />

                <NavItem title="Course Moderation" link="" />
            </div>)
        .with([P.not("LEARNER"), "CONTRIBUTOR"], () =>
            <div>
                <NavItem title="Dashboard" link="/contributor/dashboard" />

                <NavItem title="Teams" link="" />

                <NavItem title="Courses" link="" />
            </div>)
        .otherwise(() =>
            <div>
                <NavItem title="Dashboard" link="/learner/dashboard" />
                <NavItem title="Challenges" link="" />
                <NavItem title="My Courses" link="" />
            </div>)
}

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    return (
        <div className="w-1/5 min-w-[220px] h-screen shadow-lg bg-white/50 pt-16 flex flex-col justify-between">
            <div>
                <div className="px-8 py-4">
                    <p className="subtitle tracking-wider">MAIN MENU</p>

                    <SidebarByRole role={user.role} />
                </div>

                <div className="px-8 py-4">
                    <p className="subtitle tracking-wider">SYSTEM</p>

                    <NavItem title="Settings" link="" />
                    <NavItem title="Help & Support" link="" />

                    <Button variant="default" onClick={async () => {
                        await logout();
                        navigate({ to: '/' });
                    }} className="cursor-pointer w-full my-2">
                        Log out
                    </Button>
                </div>
            </div>

            <div className="items-center py-1 px-4 flex justify-around border-t-slate-300 border-t-2">
                <div className="aspect-square size-10 rounded-full bg-sky-600"></div>

                <div className="p-4 flex flex-col">
                    <div className="text-slate-700 font-bold text-sm">
                        {user.realname}
                    </div>
                    <div className="text-slate-500 text-xs">
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                    </div>
                </div>

                <div className='inline-block w-0 h-0 border-l-8 border-r-8 border-l-transparent border-r-transparent border-t-5 border-t-slate-400 ml-8'>
                    <span className='sr-only'>Dropdown</span>
                </div>
            </div>

        </div>
    )
}