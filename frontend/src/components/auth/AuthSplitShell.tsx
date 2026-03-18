import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Compass, Sparkles, Users } from 'lucide-react';

type BenefitIcon = 'insight' | 'strategy' | 'progress' | 'team';

type BenefitTile = {
  title: string;
  description: string;
  icon: BenefitIcon;
};

type AuthSplitShellProps = {
  tags: string[];
  title: string;
  description: string;
  benefits: BenefitTile[];
  children: ReactNode;
};

const iconMap: Record<BenefitIcon, LucideIcon> = {
  insight: Sparkles,
  strategy: Compass,
  progress: BarChart3,
  team: Users,
};

export default function AuthSplitShell({
  tags,
  title,
  description,
  benefits,
  children,
}: AuthSplitShellProps) {
  return (
    <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-300 bg-white/85 shadow-2xl shadow-slate-300/35 lg:grid-cols-[1.1fr_1fr]">
      <section className="relative border-b border-slate-300 p-8 lg:border-r lg:border-b-0 lg:p-10">
        <div className="relative space-y-7">
          <div className="space-y-4">
            <h2 className="text-3xl leading-tight font-semibold text-slate-900 md:text-4xl">
              {title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <p
                  key={tag}
                  className="inline-flex rounded-full border border-sky-300/80 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-sky-700 uppercase"
                >
                  {tag}
                </p>
              ))}
            </div>
            <p className="max-w-xl text-base leading-relaxed text-slate-600">
              {description}
            </p>
          </div>

          <div className="h-px w-full bg-slate-200" />

          <ul className="grid gap-3">
            {benefits.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <li
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <Icon className="size-4 stroke-[2.2]" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-8 md:p-10">
        <div className="w-full max-w-xl">{children}</div>
      </section>
    </div>
  );
}

