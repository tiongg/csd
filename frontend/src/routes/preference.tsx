import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/preference')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.auth.isLoggedIn) {
      throw redirect({ to: '/login' });
    }
  },
});

const ALL_PREFERENCES = [
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
type PreferenceType = (typeof ALL_PREFERENCES)[number];

function RouteComponent() {
  const { user, preferences } = useAuth();
  const [currentSelection, setCurrentSelection] = useState(
    new Set<PreferenceType>(),
  );

  useEffect(() => {
    setCurrentSelection(
      new Set<PreferenceType>([...(preferences ?? [])] as PreferenceType[]),
    );
  }, [preferences]);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function selectPreferenceForm() {
    const preferences = [...currentSelection];
    if (preferences.length === 0) return;
    await createNewPreferenceAsync({
      body: preferences,
    });
  }

  const { mutateAsync: createNewPreferenceAsync, isPending } = useApiMutation(
    'post',
    '/api/preference/',
    {
      onSuccess: async () => {
        toast.success('Saved Preference(s)');
        setCurrentSelection(new Set());
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/auth/me').queryKey,
        });

        // Await it so /me route can be refetched before navigation
        setTimeout(() => {
          navigate({ to: '/learner/dashboard', replace: true });
        }, 1000);
      },
      onError: () => {
        toast.error('Failed to save preference(s)');
      },
    },
  );

  function toggleSelection(preference: PreferenceType) {
    setCurrentSelection((prev) => {
      if (prev.has(preference)) {
        return new Set([...prev].filter((x) => x !== preference));
      } else {
        return new Set([...prev, preference]);
      }
    });
  }

  if (!user) {
    return (
      <div className="m-auto flex w-full flex-1 items-center justify-center p-8">
        <p className="text-xl text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="m-auto flex w-full flex-1 flex-col p-8">
      <div className="rounded-2xl border bg-white p-8">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Welcome {user?.realname},</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            Getting to know you
          </p>
          <p className="mt-1 text-slate-600">
            Pick a few topics you’d like explained. You can change this anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-3">
          {ALL_PREFERENCES.map((preference) => (
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
            Selected:
            <span className="font-medium text-slate-700">
              {currentSelection.size}
            </span>
          </p>

          <Button
            variant="default"
            size="lg"
            disabled={currentSelection.size === 0 || isPending}
            onClick={selectPreferenceForm}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
