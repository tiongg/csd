import type { GlossaryItem } from '../types';

type GlossaryCardProps = {
  item: GlossaryItem;
};

export default function GlossaryCard({ item }: GlossaryCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="text-base font-semibold text-slate-900">{item.term}</h3>
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
          {item.category}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-700">{item.meaning}</p>
      <p className="mt-1.5 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">In conversation:</span>{' '}
        <span className="italic">"{item.example}"</span>
      </p>
      <p className="mt-1.5 text-xs text-slate-500">Context: {item.context}</p>
    </article>
  );
}
