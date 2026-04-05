import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PREFERENCE_EMOJI, type PreferenceOption } from './constants';

type PreferenceOptionButtonProps = {
  option: PreferenceOption;
  selected: boolean;
  onToggle: (option: PreferenceOption) => void;
};

export default function PreferenceOptionButton({
  option,
  selected,
  onToggle,
}: PreferenceOptionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() => onToggle(option)}
      className={cn(
        'h-auto min-h-12 justify-start rounded-xl border-slate-300 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-sky-300 hover:bg-sky-50/70 hover:text-slate-900 active:scale-[0.99]',
        selected &&
          'border-sky-500 bg-sky-50 text-sky-900 shadow-[0_0_0_1px_rgba(14,116,144,0.2)]',
      )}
    >
      <span className="mr-2" aria-hidden>
        {PREFERENCE_EMOJI[option]}
      </span>
      <span>{option}</span>
    </Button>
  );
}
