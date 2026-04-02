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
import { useCallback, useMemo, useState } from 'react';
import { TrendCourseSearchDialog } from '../learner/dashboard/TrendCourseSearchDialog';
import RelationGraph from '../relations/RelationGraph';
import GlossaryCard from './components/GlossaryCard';

const SORT_A_TO_Z = 'asc';
const SORT_Z_TO_A = 'desc';
const SORT_OPTIONS = [
  { value: SORT_A_TO_Z, label: 'Alphabetic Order: A-Z' },
  { value: SORT_Z_TO_A, label: 'Alphabetic Order: Z-A' },
] as const;

type SortOrder = typeof SORT_A_TO_Z | typeof SORT_Z_TO_A;

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
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendSearch, setTrendSearch] = useState('');

  const { data: glossaryItems } = useApiQuery('get', '/api/glossary/');
  const { mutateAsync: generateGlossary } = useApiMutation(
    'post',
    '/api/glossary/',
    {
      onSuccess: () => {
        queryClient.invalidateQueries(apiQueryOptions('get', '/api/glossary/'));
      },
    },
  );

  const filteredItems = useMemo(() => {
    if (!glossaryItems) {
      return [];
    }
    const q = query.trim().toLowerCase();

    const matches = glossaryItems.filter((item) => {
      if (!q) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.context.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
      );
    });

    return matches.sort((a, b) => {
      const compare = a.title.localeCompare(b.title, undefined, {
        sensitivity: 'base',
      });
      return sortOrder === SORT_A_TO_Z ? compare : -compare;
    });
  }, [query, sortOrder, glossaryItems]);

  const onNodeClick = useCallback((nodeId: string) => {
    setTrendSearch(nodeId);
    setIsTrendModalOpen(true);
  }, []);

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

        <section className="relative h-120 rounded-2xl border border-white/75 bg-white/45 p-5 shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 md:p-6">
          <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
            Relationships
          </p>
          <RelationGraph onNodeClick={onNodeClick} />
        </section>

        <section className={glassPanelClass}>
          <div className="mb-4 flex w-full flex-col gap-3 xl:flex-row">
            <div className="flex flex-col items-center gap-3 xl:w-auto xl:flex-row">
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
            </div>
            {showGenerateButton && (
              <div className="ml-auto self-end">
                <Button
                  onClick={() => {
                    generateGlossary({});
                  }}
                >
                  Regenerate Glossary
                </Button>
              </div>
            )}
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-3">
              {filteredItems.map((item) => (
                <GlossaryCard
                  key={item.title}
                  item={item}
                  onEdit={onEditClick}
                />
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No glossary terms matched your search/category filter.
            </div>
          )}
        </section>
      </div>

      <TrendCourseSearchDialog
        initialSearchValue={trendSearch}
        open={isTrendModalOpen}
        onOpenChange={setIsTrendModalOpen}
      />
    </div>
  );
}
