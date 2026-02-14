import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { components } from '@/generated/api';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import { capitalizeFirst, type Team } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { match } from 'ts-pattern';

type TeamMember = components['schemas']['TeamMember'];

type TeamCollaboratorsDialogProps = {
  isOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  team: Team;
};

function getRoleBadgeVariant(role: TeamMember['teamRole']) {
  return match(role)
    .with('OWNER', () => 'default')
    .with('ADMIN', () => 'secondary')
    .otherwise(() => 'outline') as BadgeProps['variant'];
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
        setError(err.message || 'An error occurred while adding the member.');
      },
    },
  );

  const { mutate: onRemoveMember } = useApiMutation(
    'delete',
    '/api/teams/{teamId}/members/{accountId}',
    {
      onSuccess: onMutationSuccess,
      onError: (err) => {
        toast.error(
          err.message || 'An error occurred while removing the member.',
        );
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Team Collaborators</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Member Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="username" className="sr-only">
                Add by username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Add by username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-destructive mt-1 text-sm">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={!username.trim() || isSubmitting}
              className="shrink-0"
            >
              Add
            </Button>
          </form>

          {/* Members List */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Members ({team.members.length})
            </Label>
            <div className="max-h-64 space-y-2 overflow-auto">
              {team.members.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No members in this team yet.
                </p>
              ) : (
                team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex size-9 items-center justify-center rounded-full">
                        <span className="text-sm font-medium">
                          {member.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.username}</p>
                        <p className="text-muted-foreground text-xs">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(member.teamRole)}>
                        {capitalizeFirst(member.teamRole)}
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
                          className="text-muted-foreground hover:text-destructive"
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
