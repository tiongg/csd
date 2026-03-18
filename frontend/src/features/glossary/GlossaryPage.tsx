import SearchBar from '@/components/ui/searchbar';
import { Heading1 } from '@/components/ui/typography';
import { useMemo, useState } from 'react';

type GlossaryItem = {
  term: string;
  meaning: string;
  context: string;
};

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Skibidi',
    meaning: 'A surreal meme expression used as playful nonsense slang.',
    context: 'Meme culture / humor clips',
  },
  {
    term: 'Rizz',
    meaning: 'Charm or social game, especially in dating/flirting contexts.',
    context: 'Social slang',
  },
  {
    term: 'Fanum tax',
    meaning: "Jokingly taking a bite/share of someone else's food.",
    context: 'Creator/streamer slang',
  },
  {
    term: 'Gyatt',
    meaning: "Exclamatory slang reacting to someone's appearance.",
    context: 'Reaction slang',
  },
  {
    term: 'Sigma',
    meaning: 'Meme label for independent, lone-wolf confidence.',
    context: 'Identity meme slang',
  },
  {
    term: 'NPC',
    meaning: 'Describes repetitive/robotic behavior with little originality.',
    context: 'Gaming-origin slang',
  },
  {
    term: 'Mid',
    meaning: 'Average or unimpressive quality.',
    context: 'Opinion/review slang',
  },
  {
    term: 'No cap',
    meaning: 'For real / not lying.',
    context: 'Emphasis slang',
  },
  {
    term: 'Underconsumption core',
    meaning: 'Trend favoring mindful use of fewer products and anti-overbuying.',
    context: 'Lifestyle trend',
  },
  {
    term: 'GRWM',
    meaning: '"Get Ready With Me" format showing routines and daily prep.',
    context: 'Short-form content format',
  },
  {
    term: 'POV',
    meaning: 'Point-of-view storytelling format from a character perspective.',
    context: 'Video structure',
  },
  {
    term: 'Corecore',
    meaning: 'Emotionally layered montage edits reflecting internet-era feelings.',
    context: 'Editing aesthetic',
  },
];

export default function GlossaryPage() {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY_ITEMS;
    return GLOSSARY_ITEMS.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.context.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="w-full bg-slate-50/60 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
                Reference
              </p>
              <Heading1 className="bg-none mt-1 text-4xl leading-tight tracking-tight">
                Gen-Alpha Glossary
              </Heading1>
              <p className="mt-2 text-sm text-slate-600">
                Shared reference for current slang, meme terms, and format language.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {filteredItems.length} term{filteredItems.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="mt-4 w-full max-w-md">
            <SearchBar
              placeholder="Search term, meaning, or context"
              onSearch={setQuery}
            />
          </div>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Term</th>
                <th className="px-5 py-3.5 font-semibold">Meaning</th>
                <th className="px-5 py-3.5 font-semibold">Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.term}
                  className="border-t border-slate-200 text-slate-800 transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.term}</td>
                  <td className="px-5 py-4 leading-6 text-slate-700">{item.meaning}</td>
                  <td className="px-5 py-4 text-slate-600">{item.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="p-5 text-sm text-slate-600">No glossary terms matched.</div>
          )}
        </section>
      </div>
    </div>
  );
}
