import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { Input } from './input';

type SearchBarProps = {
  placeholder: string;
  onSearch?: (query: string) => void;
  className?: string;
  value?: string;
  onClear?: () => void;
};

export default function SearchBar({
  placeholder,
  onSearch,
  className,
  value,
  onClear,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;
  const showClearButton = Boolean(inputValue?.length);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value ?? '');
    }
  }, [isControlled, value]);

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        className={cn(
          'pl-8 placeholder:text-slate-400',
          showClearButton && 'pr-9',
          className,
        )}
        value={inputValue}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-autocomplete="none"
        onChange={(e) => {
          const nextValue = e.target.value;
          if (!isControlled) {
            setInternalValue(nextValue);
          }
          onSearch?.(nextValue);
        }}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="size-4 inline-block text-slate-400" />
      </div>
      {showClearButton ? (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
          aria-label="Clear search"
          onClick={() => {
            if (!isControlled) {
              setInternalValue('');
            }
            onSearch?.('');
            onClear?.();
          }}
        >
          <XMarkIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
