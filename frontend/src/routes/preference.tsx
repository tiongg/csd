import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/preference')({
  component: RouteComponent,
});

const allPreferences = [
  'Trending Memes',
  'Slang Terms',
  'Brainrot Terms',
  'Tiktok Trends',
  'Youtube Trends',
  'Gaming Culture',
  'Roblox Culture',
  'Snapchat Culture',
  'Discord Culture',
  'Anime Fandoms',
  'Kpop Fandoms',
  'Influencer Culture',
  'Current School Life',
  'Music Trends',
  'Fashion Aesthetics',
  'Online Etiquette',
] as const;
type preference = (typeof allPreferences)[number];

function RouteComponent() {
  const [currentSelection, setCurrentSelection] = useState(
    new Set<preference>(),
  );
  const { user } = useAuth();

  function toggleSelection(preference: preference) {
    setCurrentSelection((prev) => {
      if (prev.has(preference)) {
        return new Set([...prev].filter((x) => x !== preference));
      } else {
        return new Set([...prev, preference]);
      }
    });
  }
  console.log(currentSelection);

  return (
    <div className="m-auto flex w-full max-w-3xl flex-1 flex-col p-8">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Welcome {user?.realname},</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            Getting to know you
          </p>
          <p className="mt-1 text-slate-600">
            Pick a few topics you’d like explained. You can change this anytime.
          </p>
        </div>

        {/* <div className="flex flex-wrap gap-4 gap-x-2"> */}
        <div className="grid grid-cols-4 gap-3">
          {allPreferences.map((preference) => (
            <Button
              variant={currentSelection.has(preference) ? 'default' : 'outline'}
              className="transform transition duration-150 active:scale-95"
              key={preference}
              type="button"
              onClick={() => toggleSelection(preference)}
              size={'lg'}
            >
              {preference}
            </Button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Selected:{' '}
            <span className="font-medium text-slate-700">
              {currentSelection.size}
            </span>
          </p>

          <Button
            variant="default"
            size="lg"
            disabled={currentSelection.size === 0}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
