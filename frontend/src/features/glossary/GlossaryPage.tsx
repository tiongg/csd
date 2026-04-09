import { Button } from '@/components/ui';
import SearchBar from '@/components/ui/searchbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading1 } from '@/components/ui/typography';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import type { GlossaryItem } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { normalizeGlossaryCategory } from '@/features/relations/graph-data';
import GlossaryCard from './components/GlossaryCard';

const CATEGORY_FILTER_ALL = '__all__';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

type GlossaryPageProps = {
  onEditClick?: (item: GlossaryItem) => void;
  showGenerateButton?: boolean;
};

export default function GlossaryPage({
  onEditClick,
  showGenerateButton = false,
}: GlossaryPageProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(CATEGORY_FILTER_ALL);

  const { data: glossaryItems } = useApiQuery('get', '/api/glossary/');
  const { mutateAsync: generateGlossary, isPending: isGeneratingGlossary } =
    useApiMutation('post', '/api/glossary/', {
      onSuccess: () => {
        queryClient.invalidateQueries(apiQueryOptions('get', '/api/glossary/'));
      },
    });
  const { mutateAsync: clearGlossary, isPending: isClearingGlossary } =
    useApiMutation('delete', '/api/glossary/', {
      onSuccess: () => {
        queryClient.invalidateQueries(apiQueryOptions('get', '/api/glossary/'));
      },
    });

  const categoryOptions = useMemo(() => {
    if (!glossaryItems) {
      return [];
    }

    return Array.from(
      new Set(
        glossaryItems.map(
          (item) => normalizeGlossaryCategory(item.category) ?? 'Uncategorized',
        ),
      ),
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [glossaryItems]);

  const filteredItems = useMemo<GlossaryItem[]>(() => {
    if (!glossaryItems) {
      return [];
    }

    const normalize = (value: string | null | undefined) =>
      (value ?? '').toLowerCase();

    const q = query.trim().toLowerCase();

    return [...glossaryItems]
      .filter((item) => {
        const normalizedCategory =
          normalizeGlossaryCategory(item.category) ?? 'Uncategorized';
        const matchesCategory =
          categoryFilter === CATEGORY_FILTER_ALL ||
          normalizedCategory === categoryFilter;

        if (!matchesCategory) {
          return false;
        }

        if (!q) {
          return true;
        }

        return (
          normalize(item.title).includes(q) ||
          normalize(item.description).includes(q) ||
          normalize(item.context).includes(q) ||
          normalize(item.example).includes(q) ||
          normalize(item.category).includes(q) ||
          normalize(normalizedCategory).includes(q)
        );
      })
      .sort((a, b) =>
        (a.title ?? '').localeCompare(b.title ?? '', undefined, {
          sensitivity: 'base',
        }),
      );
  }, [categoryFilter, query, glossaryItems]);

  return (
    <div className="flex">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className={glassPanelClass}>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Reference
          </p>
          <Heading1 className="mt-3">
            Gen-Alpha Glossary
          </Heading1>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Understand slang and meme vocabulary with practical conversation examples.
          </p>
        </section>

        <section className={glassPanelClass}>
          <div className="mb-4 flex w-full flex-col gap-3 xl:flex-row">
            <div className="flex flex-col items-center gap-3 xl:w-auto xl:flex-row">
              <div className="w-full xl:w-96">
                <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Search
                </p>
                <SearchBar
                  placeholder="Search term, meaning, context, or example"
                  onSearch={setQuery}
                  value={query}
                  className="border-slate-300/85 bg-slate-100/70"
                />
              </div>

              <div className="w-full xl:w-64">
                <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Category
                </p>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-10 w-full border-slate-300/85 bg-slate-100/70">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value={CATEGORY_FILTER_ALL}>All categories</SelectItem>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {showGenerateButton && (
              <div className="ml-auto flex items-center gap-2 self-end">
                <Button
                  disabled={isGeneratingGlossary || isClearingGlossary}
                  onClick={() => {
                    generateGlossary({});
                  }}
                >
                  {isGeneratingGlossary
                    ? 'Generating...'
                    : 'Regenerate Glossary'}
                </Button>
                <Button
                  variant="destructive"
                  disabled={isClearingGlossary || isGeneratingGlossary}
                  onClick={() => {
                    clearGlossary({});
                  }}
                >
                  {isClearingGlossary ? 'Clearing...' : 'Clear All'}
                </Button>
              </div>
            )}
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-3">
              {filteredItems.map((item) => (
                <GlossaryCard key={item.title} item={item} onEdit={onEditClick} />
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No glossary terms matched your search.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
