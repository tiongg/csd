import { Button } from '@/components/ui';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

const SORT_A_TO_Z = 'asc';
const SORT_Z_TO_A = 'desc';
const CATEGORY_FILTER_ALL = '__all__';
const SORT_OPTIONS = [
  { value: SORT_A_TO_Z, label: 'Alphabetic Order: A-Z' },
  { value: SORT_Z_TO_A, label: 'Alphabetic Order: Z-A' },
] as const;

type SortOrder = typeof SORT_A_TO_Z | typeof SORT_Z_TO_A;

type GroupedGlossarySection = {
  category: string;
  items: GlossaryItem[];
};

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
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_A_TO_Z);
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

  const groupedItems = useMemo<GroupedGlossarySection[]>(() => {
    if (!glossaryItems) {
      return [];
    }

    const normalize = (value: string | null | undefined) =>
      (value ?? '').toLowerCase();

    const q = query.trim().toLowerCase();

    const matches = glossaryItems.filter((item) => {
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
    });

    const sortedItems = matches.sort((a, b) => {
      const compare = (a.title ?? '').localeCompare(b.title ?? '', undefined, {
        sensitivity: 'base',
      });
      return sortOrder === SORT_A_TO_Z ? compare : -compare;
    });

    const grouped = new Map<string, GlossaryItem[]>();
    sortedItems.forEach((item) => {
      const category = normalizeGlossaryCategory(item.category) ?? 'Uncategorized';
      const existingItems = grouped.get(category) ?? [];
      existingItems.push(item);
      grouped.set(category, existingItems);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .map(([category, items]) => ({
        category,
        items,
      }));
  }, [categoryFilter, query, sortOrder, glossaryItems]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-slate-100/70 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className={glassPanelClass}>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Reference
          </p>
          <Heading1 className="mt-1 text-4xl leading-tight tracking-tight">
            Gen-Alpha Glossary
          </Heading1>
          <p className="mt-2 max-w-4xl text-sm text-slate-600">
            Expanded slang and meme vocabulary with practical conversation
            examples for writing, moderation, and learner context.
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
                  className="h-10 border-slate-300/85 bg-slate-100/70"
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

              <div className="w-full xl:w-64">
                <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Sorting
                </p>
                <Select
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value as SortOrder)}
                >
                  <SelectTrigger className="h-10 w-full border-slate-300/85 bg-slate-100/70">
                    <SelectValue placeholder="Alphabetic Order: A-Z" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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

          {groupedItems.length > 0 ? (
            <Accordion type="multiple" className="space-y-3">
              {groupedItems.map((section) => (
                <AccordionItem
                  key={section.category}
                  value={section.category}
                  className="rounded-xl border border-slate-200/80 bg-white/55 px-4"
                >
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <div className="text-left">
                      <h2 className="text-lg font-semibold tracking-[0.06em] text-sky-700 uppercase">
                        {section.category}
                      </h2>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-4">
                    <div className="grid gap-3">
                      {section.items.map((item) => (
                        <GlossaryCard
                          key={item.title}
                          item={item}
                          onEdit={onEditClick}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
