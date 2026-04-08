import { cn, type GlossaryItem } from '@/lib/utils';
import { Edit2Icon } from 'lucide-react';

export type GlossaryCardProps = {
  item: GlossaryItem;
  onEdit?: (item: GlossaryItem) => void;
};

export default function GlossaryCard({ item, onEdit }: GlossaryCardProps) {
  return (
    <article className="group relative rounded-xl border border-slate-300/85 bg-white/95 p-4 md:p-5">
      {onEdit && (
        <button
          onClick={() => onEdit(item)}
          className="absolute top-3 right-3 rounded-md p-1.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Edit"
        >
          <Edit2Icon className="h-4 w-4" />
        </button>
      )}

      <div
        className={cn('flex flex-wrap items-center gap-2.5', onEdit && 'pr-8')}
      >
        <h3 className="text-base font-semibold text-sky-800">{item.title}</h3>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-700">
        {item.description}
      </p>
      <p className="mt-1.5 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">In conversation:</span>{' '}
        <span className="italic">"{item.example}"</span>
      </p>
      <p className="mt-1.5 text-xs text-slate-500">Context: {item.context}</p>
    </article>
  );
}
