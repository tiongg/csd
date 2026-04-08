import { useAuth } from '@/context/AuthContext';
import { Link } from '@tanstack/react-router';

export function DesmosLaunchTile() {
  const { user } = useAuth();
  const desmosPath =
    user?.role === 'ADMIN'
      ? '/admin/desmos'
      : user?.role === 'CONTRIBUTOR'
        ? '/contributor/desmos'
        : '/learner/desmos';

  return (
    <Link
      to={desmosPath}
      aria-label="Open Desmos node graph"
      title="Open Desmos"
      className="group relative flex h-24 w-full min-w-0 items-center overflow-hidden rounded-[24px] border border-slate-300 bg-white/85 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_0_0_1px_rgba(226,232,240,0.9)] transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white focus-visible:-translate-y-0.5 focus-visible:border-sky-300/80 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.78))] transition-opacity duration-200 group-hover:opacity-95" />
      <div className="absolute inset-0 opacity-55 transition-[opacity,transform] duration-200 group-hover:opacity-75 group-hover:scale-[1.02] [background-image:linear-gradient(rgba(226,232,240,0.75)_1px,transparent_1px),linear-gradient(90deg,rgba(226,232,240,0.75)_1px,transparent_1px)] [background-size:34px_34px]" />
      <span className="absolute left-3 top-4 size-3.5 rounded-full bg-sky-500/85 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110" />
      <span className="absolute left-10 top-2.5 size-2.5 rotate-45 rounded-[2px] bg-violet-400/80 transition-transform duration-200 group-hover:-translate-y-1 group-hover:rotate-90" />
      <span className="absolute left-9 bottom-4 size-3 rounded-full bg-emerald-400/80 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:scale-105" />
      <span className="absolute left-20 top-5 size-0 border-r-[6px] border-b-[10px] border-l-[6px] border-r-transparent border-b-amber-300/85 border-l-transparent transition-transform duration-200 group-hover:-translate-y-1 group-hover:rotate-6" />

      <span className="absolute right-3 top-1/2 size-4 -translate-y-1/2 rounded-full bg-violet-400/85 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-105" />
      <span className="absolute right-10 top-6 size-2.5 rotate-45 rounded-[2px] bg-amber-300/85 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:rotate-[60deg]" />
      <span className="absolute right-11 bottom-5 size-3 rounded-full bg-sky-400/80 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:scale-110" />
      <span className="absolute right-22 bottom-3 size-0 border-r-[5px] border-b-[9px] border-l-[5px] border-r-transparent border-b-emerald-400/80 border-l-transparent transition-transform duration-200 group-hover:translate-y-0.5 group-hover:-rotate-6" />

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="flex min-w-0 flex-col items-center justify-center text-center">
          <span className="text-[15px] font-semibold leading-none tracking-[0.16em] text-slate-900 transition-colors duration-200 group-hover:text-sky-900">
            Desmos
          </span>
          <span className="mt-0.5 text-[11px] leading-none text-slate-500 transition-colors duration-200 group-hover:text-slate-600">
            Explore how ideas connect.
          </span>
        </div>
      </div>
    </Link>
  );
}
