import { useAuth } from '@/context/AuthContext';
import PreferenceSelectionCard from '@/features/preference/PreferenceSelectionCard';
import {
  MAX_PREFERENCE_SELECTION,
  PREFERENCE_OPTIONS,
  type PreferenceOption,
} from '@/features/preference/constants';
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

function RouteComponent() {
  const { user, preferences } = useAuth();
  const [currentSelection, setCurrentSelection] = useState(
    new Set<PreferenceOption>(),
  );

  useEffect(() => {
    const validOptions = new Set(PREFERENCE_OPTIONS);
    const normalizedPreferences = (preferences ?? []).filter(
      (preference): preference is PreferenceOption =>
        validOptions.has(preference as PreferenceOption),
    );

    setCurrentSelection(
      new Set<PreferenceOption>(
        normalizedPreferences.slice(0, MAX_PREFERENCE_SELECTION),
      ),
    );
  }, [preferences]);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: createNewPreferenceAsync, isPending } = useApiMutation(
    'post',
    '/api/preference/',
    {
      onSuccess: async () => {
        toast.success('Saved preferences');
        setCurrentSelection(new Set<PreferenceOption>());
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/auth/me').queryKey,
        });

        setTimeout(() => {
          navigate({ to: '/learner/dashboard', replace: true });
        }, 1000);
      },
      onError: () => {
        toast.error('Failed to save preferences');
      },
    },
  );

  async function savePreferences() {
    const selectedPreferences = [...currentSelection];
    if (selectedPreferences.length === 0) return;

    await createNewPreferenceAsync({
      body: selectedPreferences,
    });
  }

  function toggleSelection(preference: PreferenceOption) {
    setCurrentSelection((prev) => {
      if (prev.has(preference)) {
        return new Set([...prev].filter((option) => option !== preference));
      }

      if (prev.size >= MAX_PREFERENCE_SELECTION) {
        toast.error(`You can select up to ${MAX_PREFERENCE_SELECTION} preferences.`);
        return prev;
      }

      return new Set([...prev, preference]);
    });
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-52px)] items-center justify-center bg-[radial-gradient(circle_at_top_left,_#ffffff,_#f8fafc_40%,_#e2e8f0)] p-8">
        <p className="text-xl text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-52px)] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#ffffff,_#f8fafc_40%,_#e2e8f0)] px-4 py-8 md:px-8">
      <PreferenceSelectionCard
        selection={currentSelection}
        isPending={isPending}
        onToggleOption={toggleSelection}
        onSave={savePreferences}
      />
    </div>
  );
}
