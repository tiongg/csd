import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { components } from '@/generated/api';
import { apiQueryOptions, useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { type Team } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, UserPlus } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { match } from 'ts-pattern';
import TeamMemberAvatar from './TeamMemberAvatar';

type TeamMember = components['schemas']['TeamMember'];

type TeamCollaboratorsDialogProps = {
  isOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  team: Team;
};

function getRoleBadgeClass(role: TeamMember['teamRole']) {
  return match(role)
    .with('OWNER', () => 'border-amber-300 bg-amber-100 text-amber-800')
    .with('ADMIN', () => 'border-sky-300 bg-sky-100 text-sky-800')
    .otherwise(() => 'border-slate-300 bg-slate-100 text-slate-700');
}

function getRoleDisplay(role: TeamMember['teamRole']) {
  return match(role)
    .with('OWNER', () => 'Owner')
    .with('ADMIN', () => 'Admin')
    .otherwise(() => 'Member');
}

export default function TeamCollaboratorsDialog({
  isOpen,
  setDialogOpen,
  team,
}: TeamCollaboratorsDialogProps) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: accounts } = useApiQuery('get', '/api/account/', {});
  const accountProfilePictureMap = useMemo(
    () =>
      new Map(
        (accounts ?? []).map((account) => [account.id, account.profilePictureUrl]),
      ),
    [accounts],
  );

  async function onMutationSuccess() {
    await queryClient.invalidateQueries({
      queryKey: apiQueryOptions('get', '/api/teams/{teamId}', {
        params: {
          path: { teamId: team.id },
        },
      }).queryKey,
    });

    await queryClient.invalidateQueries({
      queryKey: apiQueryOptions('get', '/api/teams/').queryKey,
    });

    setError(null);
  }

  const { mutateAsync: addMemberAsync } = useApiMutation(
    'post',
    '/api/teams/{teamId}/members',
    {
      onSuccess: onMutationSuccess,
      onError: (err) => {
        setError(err.message || 'Unable to add this team member.');
      },
    },
  );

  const { mutate: onRemoveMember } = useApiMutation(
    'delete',
    '/api/teams/{teamId}/members/{accountId}',
    {
      onSuccess: onMutationSuccess,
      onError: (err) => {
        toast.error(err.message || 'Unable to remove this team member.');
      },
    },
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    try {
      await addMemberAsync({
        params: {
          path: { teamId: team.id },
        },
        body: {
          username: username.trim(),
        },
      });
      setUsername('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-xl rounded-xl border-slate-200 p-5">
        <DialogHeader>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Team Management
          </p>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Team Members
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Add or remove members from this team workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <Label htmlFor="username" className="mb-2 block text-sm font-medium">
              Add by username
            </Label>
            <div className="flex gap-2">
              <Input
                id="username"
                type="text"
                placeholder="e.g., alice_lee"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="h-10 border-slate-300 bg-white focus-visible:border-slate-400 focus-visible:ring-0"
              />
              <Button
                type="submit"
                disabled={!username.trim() || isSubmitting}
                className="h-10 shrink-0 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              >
                <UserPlus className="size-4" />
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
            {error && (
              <p className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-700">
                {error}
              </p>
            )}
          </form>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-600">
              Team Members ({team.members.length})
            </Label>
            <div className="max-h-72 space-y-2 overflow-auto pr-1">
              {team.members.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No members in this team yet.
                </p>
              ) : (
                team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="shrink-0"
                      >
                        <TeamMemberAvatar
                          member={member}
                          profilePictureUrl={accountProfilePictureMap.get(
                            member.accountId,
                          )}
                          fallbackText={member.username.charAt(0).toUpperCase()}
                          className="size-8 text-xs"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {member.username}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="ml-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getRoleBadgeClass(member.teamRole)}
                      >
                        {getRoleDisplay(member.teamRole)}
                      </Badge>
                      {member.teamRole !== 'OWNER' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            onRemoveMember({
                              params: {
                                path: {
                                  teamId: team.id,
                                  accountId: member.accountId,
                                },
                              },
                            })
                          }
                          className="text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
