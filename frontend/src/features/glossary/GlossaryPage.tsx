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
    meaning: 'Jokingly taking a bite/share of someone else’s food.',
    context: 'Creator/streamer slang',
  },
  {
    term: 'Gyatt',
    meaning: 'Exclamatory slang reacting to someone’s appearance.',
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
    meaning: '“Get Ready With Me” format showing routines and daily prep.',
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
    <div className="w-full bg-slate-50 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <Heading1>Gen-Alpha Glossary</Heading1>
          <p className="mt-2 text-sm text-slate-600">
            Shared reference for current slang, meme terms, and format language.
          </p>
          <div className="mt-4 w-full max-w-md">
            <SearchBar
              placeholder="Search term, meaning, or context"
              onSearch={setQuery}
            />
          </div>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Term</th>
                <th className="px-5 py-3 font-semibold">Meaning</th>
                <th className="px-5 py-3 font-semibold">Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.term} className="border-t border-slate-200 text-slate-800">
                  <td className="px-5 py-3 font-semibold">{item.term}</td>
                  <td className="px-5 py-3">{item.meaning}</td>
                  <td className="px-5 py-3 text-slate-600">{item.context}</td>
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

