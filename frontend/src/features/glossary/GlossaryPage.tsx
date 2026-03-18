import SearchBar from '@/components/ui/searchbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading1 } from '@/components/ui/typography';
import { useMemo, useState } from 'react';

type GlossaryCategory =
  | 'Meme Slang'
  | 'Social & Dating'
  | 'Creator Formats'
  | 'Style & Culture'
  | 'Gaming & Internet'
  | 'Mindset & Study';

type GlossaryItem = {
  term: string;
  meaning: string;
  context: string;
  category: GlossaryCategory;
};

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Skibidi',
    meaning: 'Absurd meme slang used playfully as nonsense, praise, or mockery.',
    context: 'Viral meme language',
    category: 'Meme Slang',
  },
  {
    term: 'Rizz',
    meaning: 'Charm or flirting ability, especially in social/dating situations.',
    context: 'Social slang',
    category: 'Social & Dating',
  },
  {
    term: 'Fanum tax',
    meaning: "Jokingly taking someone else\'s food or claiming a share.",
    context: 'Streamer-origin meme',
    category: 'Meme Slang',
  },
  {
    term: 'Gyatt',
    meaning: 'Exclamation showing strong excitement or admiration.',
    context: 'Reaction slang',
    category: 'Meme Slang',
  },
  {
    term: 'Sigma',
    meaning: 'A self-styled lone-wolf archetype; often used ironically as meme slang.',
    context: 'Identity meme slang',
    category: 'Social & Dating',
  },
  {
    term: 'Delulu',
    meaning: 'Delusional; also used jokingly for bold overconfidence in your goals.',
    context: 'Fandom and self-talk slang',
    category: 'Mindset & Study',
  },
  {
    term: 'Brain rot',
    meaning: 'Low-quality addictive online content, or the mental fatigue from consuming it.',
    context: 'Internet culture critique',
    category: 'Mindset & Study',
  },
  {
    term: 'Ohio',
    meaning: 'A meme shorthand for bizarre, cursed, or chaotic situations.',
    context: 'Irony meme language',
    category: 'Meme Slang',
  },
  {
    term: 'Aura',
    meaning: 'Perceived cool factor, confidence, or social presence.',
    context: 'Status/identity slang',
    category: 'Social & Dating',
  },
  {
    term: 'NPC',
    meaning: 'Describes repetitive or unoriginal behavior, from game non-player characters.',
    context: 'Gaming-origin slang',
    category: 'Gaming & Internet',
  },
  {
    term: 'Sus',
    meaning: 'Suspicious or sketchy.',
    context: 'Gaming and chat slang',
    category: 'Gaming & Internet',
  },
  {
    term: 'Ratio',
    meaning: 'When replies/quote-posts strongly outweigh likes, signaling disagreement.',
    context: 'Platform engagement slang',
    category: 'Gaming & Internet',
  },
  {
    term: 'Touch grass',
    meaning: 'Go offline and reconnect with real life.',
    context: 'Online behavior slang',
    category: 'Gaming & Internet',
  },
  {
    term: 'No cap',
    meaning: 'For real; I am not lying or exaggerating.',
    context: 'Emphasis slang',
    category: 'Meme Slang',
  },
  {
    term: 'Bet',
    meaning: 'Okay, agreed, say less.',
    context: 'Quick agreement slang',
    category: 'Meme Slang',
  },
  {
    term: 'Mid',
    meaning: 'Average or unimpressive.',
    context: 'Opinion/review slang',
    category: 'Meme Slang',
  },
  {
    term: 'Cooked',
    meaning: 'Done for, exhausted, or in trouble; sometimes means finished/completed.',
    context: 'Performance and stress slang',
    category: 'Mindset & Study',
  },
  {
    term: 'Locked in',
    meaning: 'Deeply focused and fully concentrated.',
    context: 'Study/productivity slang',
    category: 'Mindset & Study',
  },
  {
    term: 'Yap / yapping',
    meaning: 'Talking too much or rambling.',
    context: 'Chat/reaction slang',
    category: 'Meme Slang',
  },
  {
    term: 'Ick',
    meaning: 'A sudden feeling of attraction turning into disgust.',
    context: 'Dating and relationship slang',
    category: 'Social & Dating',
  },
  {
    term: 'Simp',
    meaning: 'Someone showing excessive devotion to a crush/person.',
    context: 'Dating/social slang',
    category: 'Social & Dating',
  },
  {
    term: 'Canon event',
    meaning: 'A key moment that shapes someone and cannot be avoided.',
    context: 'Pop-culture life meme',
    category: 'Style & Culture',
  },
  {
    term: 'Lore',
    meaning: 'Backstory, deep context, or hidden history around a person/topic.',
    context: 'Fandom and creator language',
    category: 'Style & Culture',
  },
  {
    term: 'Mewing',
    meaning: 'A jaw-posture trend claimed online to improve facial definition.',
    context: 'Looks and self-improvement trend',
    category: 'Style & Culture',
  },
  {
    term: 'Looksmaxxing',
    meaning: 'Optimizing appearance through grooming, styling, and routines.',
    context: 'Appearance optimization slang',
    category: 'Style & Culture',
  },
  {
    term: 'Drip',
    meaning: 'Stylish outfit or strong fashion presence.',
    context: 'Fashion slang',
    category: 'Style & Culture',
  },
  {
    term: 'GRWM',
    meaning: '"Get Ready With Me" content showing prep or routine.',
    context: 'Short-form content format',
    category: 'Creator Formats',
  },
  {
    term: 'POV',
    meaning: 'Point-of-view storytelling format from a specific perspective.',
    context: 'Video structure',
    category: 'Creator Formats',
  },
  {
    term: 'Corecore',
    meaning: 'Emotionally layered montage edits reflecting internet-era feelings.',
    context: 'Editing aesthetic',
    category: 'Creator Formats',
  },
  {
    term: 'Underconsumption core',
    meaning: 'Trend centered on buying less and using what you already own.',
    context: 'Lifestyle trend',
    category: 'Style & Culture',
  },
];

const ALL_CATEGORIES = 'All Categories';
type CategoryFilter = GlossaryCategory | typeof ALL_CATEGORIES;

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>(ALL_CATEGORIES);

  const categories = useMemo<GlossaryCategory[]>(() => {
    const unique = new Set<GlossaryCategory>(
      GLOSSARY_ITEMS.map((item) => item.category),
    );
    return Array.from(unique);
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY_ITEMS.filter((item) => {
      const categoryMatch =
        category === ALL_CATEGORIES ? true : item.category === category;
      if (!categoryMatch) return false;

      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.context.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <div className="flex min-h-0 flex-1 flex-col w-full bg-slate-100/70 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Reference
          </p>
          <Heading1 className="mt-1 bg-none text-4xl leading-tight tracking-tight">
            Gen-Alpha Glossary
          </Heading1>
          <p className="mt-2 max-w-4xl text-sm text-slate-600">
            Expanded slang and meme vocabulary curated for course writing,
            moderation, and learner context.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-64">
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as CategoryFilter)}
              >
                <SelectTrigger className="h-10 w-full bg-white">
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
            <div className="w-full sm:w-80">
              <SearchBar
                placeholder="Search term, meaning, context"
                onSearch={setQuery}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Term</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Meaning</th>
                  <th className="px-4 py-3 font-semibold">Context</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.term}
                    className="border-t border-slate-200 text-slate-800 transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{item.term}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 leading-6 text-slate-700">{item.meaning}</td>
                    <td className="px-4 py-3.5 text-slate-600">{item.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
