import { Button } from '@/components/ui/button';
import PreferenceOptionButton from './PreferenceOptionButton';
import {
  MAX_PREFERENCE_SELECTION,
  PREFERENCE_OPTIONS,
  type PreferenceOption,
} from './constants';

type PreferenceSelectionCardProps = {
  selection: Set<PreferenceOption>;
  isPending: boolean;
  onToggleOption: (option: PreferenceOption) => void;
  onSave: () => void;
};

export default function PreferenceSelectionCard({
  selection,
  isPending,
  onToggleOption,
  onSave,
}: PreferenceSelectionCardProps) {
  return (
    <div className="w-full max-w-4xl rounded-3xl border border-slate-300 bg-white/90 p-6 shadow-xl shadow-slate-300/25 sm:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Personalize your feed
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Select up to {MAX_PREFERENCE_SELECTION} topics you want explained
          first.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PREFERENCE_OPTIONS.map((option) => (
          <PreferenceOptionButton
            key={option}
            option={option}
            selected={selection.has(option)}
            onToggle={onToggleOption}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Selected:{' '}
          <span className="font-semibold text-slate-700">
            {selection.size}/{MAX_PREFERENCE_SELECTION}
          </span>
        </p>

        <Button
          onClick={onSave}
          disabled={selection.size === 0 || isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? 'Saving...' : 'Save preferences'}
        </Button>
      </div>
    </div>
  );
}
