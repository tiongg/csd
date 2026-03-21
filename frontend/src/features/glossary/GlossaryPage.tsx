import { useMemo, useState } from 'react';
import GlossaryCard from './components/GlossaryCard';
import { GLOSSARY_ITEMS } from './data/glossaryItems';
import type { GlossaryCategory } from './types';
import { Heading1 } from '@/components/ui/typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SearchBar from '@/components/ui/searchbar';

const ALL_CATEGORIES = 'All Categories';
const SORT_A_TO_Z = 'asc';
const SORT_Z_TO_A = 'desc';
const SORT_OPTIONS = [
  { value: SORT_A_TO_Z, label: 'Alphabetic Order: A-Z' },
  { value: SORT_Z_TO_A, label: 'Alphabetic Order: Z-A' },
] as const;

type CategoryFilter = GlossaryCategory | typeof ALL_CATEGORIES;
type SortOrder = typeof SORT_A_TO_Z | typeof SORT_Z_TO_A;

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>(ALL_CATEGORIES);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_A_TO_Z);

  const categories = useMemo<Array<GlossaryCategory>>(() => {
    const unique = new Set<GlossaryCategory>(
      GLOSSARY_ITEMS.map((item) => item.category),
    );
    return Array.from(unique);
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matches = GLOSSARY_ITEMS.filter((item) => {
      const categoryMatch =
        category === ALL_CATEGORIES ? true : item.category === category;
      if (!categoryMatch) {
        return false;
      }

      if (!q) {
        return true;
      }

      return (
        item.term.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.context.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });

    return matches.sort((a, b) => {
      const compare = a.term.localeCompare(b.term, undefined, {
        sensitivity: 'base',
      });
      return sortOrder === SORT_A_TO_Z ? compare : -compare;
    });
  }, [category, query, sortOrder]);

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
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end">
            <div className="w-full xl:w-64">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                Category
              </p>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as CategoryFilter)}
              >
                <SelectTrigger className="h-10 w-full border-slate-300/85 bg-slate-100/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value={ALL_CATEGORIES}>{ALL_CATEGORIES}</SelectItem>
                  {categories.map((itemCategory) => (
                    <SelectItem key={itemCategory} value={itemCategory}>
                      {itemCategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full flex-col gap-3 xl:ml-auto xl:w-auto xl:flex-row xl:items-end">
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
          </div>

          {filteredItems.length > 0 && (
            <div className="grid gap-3">
              {filteredItems.map((item) => (
                <GlossaryCard key={item.term} item={item} />
              ))}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No glossary terms matched your search/category filter.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
