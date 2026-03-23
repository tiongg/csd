import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { forwardRef, useCallback, useState, type KeyboardEvent } from 'react';

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 50;

type TagInputProps = {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ value = [], onChange, placeholder = 'Add tag...', disabled, className }, ref) => {
    const [inputValue, setInputValue] = useState('');
    const internalRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    const setRef = useCallback((node: HTMLInputElement | null) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      internalRef.current = node;
    }, [ref]);

    const tags = value ?? [];

    const addTag = useCallback(
      (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed || tags.length >= MAX_TAGS) {
          return;
        }
        if (trimmed.length > MAX_TAG_LENGTH) {
          return;
        }
        if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
          return;
        }
        onChange?.([...tags, trimmed]);
      },
      [tags, onChange]
    );

    const removeTag = useCallback(
      (index: number) => {
        const newTags = tags.filter((_, i) => i !== index);
        onChange?.(newTags);
      },
      [tags, onChange]
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          addTag(inputValue);
          setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
          removeTag(tags.length - 1);
        }
      },
      [inputValue, tags, addTag, removeTag]
    );

    const handleBlur = useCallback(() => {
      if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue('');
      }
    }, [inputValue, addTag]);

    return (
      <div
        className={cn(
          'border-input has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'flex min-h-9 w-full flex-wrap gap-2 rounded-md border bg-transparent px-3 py-1.5 text-sm shadow-xs transition-[color,box-shadow] outline-none',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="gap-1 pr-1.5 pl-2.5 py-0.5 text-sm"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-secondary-foreground/20 rounded-full p-0.5 transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
        {tags.length < MAX_TAGS && (
          <Input
            ref={setRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="h-fit min-w-24 flex-1 border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        )}
      </div>
    );
  }
);

TagInput.displayName = 'TagInput';

