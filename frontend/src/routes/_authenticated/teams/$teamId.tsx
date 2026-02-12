import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Crown, Mail, Trash2, UserPlus, Users, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export const Route = createFileRoute('/_authenticated/teams/$teamId')({
  component: TeamDetailPage,
});

const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

function TeamDetailPage() {
  const { teamId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');

  const { data: team, isLoading, refetch } = useApiQuery(
    'get',
    '/api/teams/{teamId}',
    {
      params: { path: { teamId } },
    }
  );

  const { data: allAccounts } = useApiQuery('get', '/api/account/', {});

  const { mutateAsync: deleteTeam } = useApiMutation(
    'delete',
    '/api/teams/{teamId}',
    {
      onSuccess: () => navigate({ to: '/teams' }),
    }
  );

  const { mutateAsync: addMember } = useApiMutation(
    'post',
    '/api/teams/{teamId}/members',
    {
      onSuccess: () => {
        refetch();
        setShowAddMember(false);
        reset();
      },
    }
  );

  const { mutateAsync: removeMember } = useApiMutation(
    'delete',
    '/api/teams/{teamId}/members/{accountId}',
    {
      onSuccess: () => refetch(),
    }
  );

  const { mutateAsync: updateMemberRole } = useApiMutation(
    'put',
    '/api/teams/{teamId}/members/{accountId}/role',
    {
      onSuccess: () => {
        refetch();
        setEditingMemberId(null);
      },
    }
  );

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
    reset,
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  async function onAddMember(data: AddMemberFormValues) {
    try {
      const account = allAccounts?.find((acc) => acc.email === data.email);
      if (!account) {
        setError('email', {
          type: 'custom',
          message: 'User not found',
        });
        return;
      }

      await addMember({
        params: { path: { teamId } },
        body: {
          accountId: account.id,
          teamRole: data.role,
        },
      });
    } catch (error: any) {
      setError('root', {
        type: 'custom',
        message: error?.message || 'Failed to add member',
      });
    }
  }

  async function handleDeleteTeam() {
    if (confirm('Are you sure you want to delete this team?')) {
      await deleteTeam({ params: { path: { teamId } } });
    }
  }

  async function handleRemoveMember(accountId: string) {
    if (confirm('Are you sure you want to remove this member?')) {
      await removeMember({
        params: { path: { teamId, accountId } },
      });
    }
  }

  function startEditingRole(memberId: string, currentRole: string) {
    setEditingMemberId(memberId);
    setEditingRole(currentRole);
  }

  async function saveRoleEdit(accountId: string) {
    try {
      await updateMemberRole({
        params: { path: { teamId, accountId } },
        body: { role: editingRole },
      });
    } catch (error: any) {
      alert(error?.message || 'Failed to update role');
      setEditingMemberId(null);
    }
  }

  function cancelRoleEdit() {
    setEditingMemberId(null);
    setEditingRole('');
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading team...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Team not found</div>
      </div>
    );
  }

  const currentUserMember = team.members?.find((m) => m.accountId === user?.id);
  const isOwner = team.ownerId === user?.id;
  const isAdmin = currentUserMember?.teamRole === 'ADMIN';
  const canManage = isOwner || isAdmin;
  const canEditRoles = canManage;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground mt-2">
              {team.description || 'No description'}
            </p>
          </div>
          {isOwner && (
            <Button variant="destructive" size="sm" onClick={handleDeleteTeam}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Team
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">
              Team Members ({team.members?.length || 0})
            </h2>
          </div>
          {canManage && (
            <Button size="sm" onClick={() => setShowAddMember(!showAddMember)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>

        {showAddMember && (
          <form
            onSubmit={handleSubmit(onAddMember)}
            className="mb-6 p-4 bg-muted rounded-lg space-y-4"
          >
            <FieldGroup>
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">User Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <Controller
                control={control}
                name="role"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="role">Role</FieldLabel>
                    <select
                      {...field}
                      id="role"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Owner</option>
                    </select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {errors.root && (
              <div className="text-destructive text-sm">
                {errors.root.message}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddMember(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {team.members?.map((member) => {
            const isTeamOwner = member.accountId === team.ownerId;
            const canEditThisMember = canEditRoles && (!isTeamOwner || isOwner);
            const canRemoveThisMember = canManage && !isTeamOwner;
            const isEditingThis = editingMemberId === member.id;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-400 flex items-center justify-center text-white font-semibold">
                    {member.username.at(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.username}</span>
                      {isTeamOwner && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isEditingThis ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="text-sm px-2 py-1 border rounded"
                        disabled={isAdmin && isTeamOwner}
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="OWNER">OWNER</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => saveRoleEdit(member.accountId)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={cancelRoleEdit}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm px-2 py-1 bg-muted rounded">
                        {member.teamRole}
                      </span>
                      {canEditThisMember && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            startEditingRole(member.id, member.teamRole)
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {canRemoveThisMember && !isEditingThis && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveMember(member.accountId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}