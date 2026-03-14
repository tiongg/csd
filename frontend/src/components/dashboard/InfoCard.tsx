import { cn } from '@/lib/utils';

const INFO_CARD_STYLES = {
  danger: 'text-rose-400 border-rose-400',
  warning: 'text-amber-500 border-amber-500',
  default: 'text-slate-800 border-slate-400',
} as const;

type InfoCardProps = {
  title: string;
  value: string;
  variant: keyof typeof INFO_CARD_STYLES;
};

export function InfoCard({ title, value, variant }: InfoCardProps) {
  return (
    <div
      className={cn(
        'flex w-0 grow flex-col gap-4 rounded-lg border-2 p-8 text-center',
        INFO_CARD_STYLES[variant],
      )}
    >
      <div className="text-lg font-bold">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
