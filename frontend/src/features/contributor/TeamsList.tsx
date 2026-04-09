import { Button } from '@/components/ui/button';
import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import { type Team } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { useBoolean } from 'usehooks-ts';
import CreateNewTeamDialog from './CreateNewTeamDialog';
import EditTeamDialog from './EditTeamDialog';
import TeamMemberAvatar from './TeamMemberAvatar';

export default function TeamsList() {
  const { data: teams, isLoading } = useApiQuery('get', '/api/teams/');
  const { data: accounts } = useApiQuery('get', '/api/account/', {});
  const accountProfilePictureMap = useMemo(
    () =>
      new Map(
        (accounts ?? []).map((account) => [account.id, account.profilePictureUrl]),
      ),
    [accounts],
  );

  const {
    value: isCreateTeamDialogOpen,
    setTrue: openCreateTeamDialog,
    setValue: setCreateTeamDialogOpen,
  } = useBoolean(false);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
              Team Management
            </p>
            <Heading1 className="mt-3 text-slate-900">
              Your Teams
            </Heading1>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Create, organize, and enter each team workspace.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            {(teams ?? []).length} team{(teams ?? []).length === 1 ? '' : 's'}
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CreateTeamCard onInteract={openCreateTeamDialog} />
          {isLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
              <LoadingTeamCard key={idx} />
            ))
            : (teams ?? []).map((team) => (
              <TeamCard
                team={team}
                key={team.id}
                accountProfilePictureMap={accountProfilePictureMap}
              />
            ))}
        </div>
      </section>

      <CreateNewTeamDialog
        isOpen={isCreateTeamDialogOpen}
        setDialogOpen={setCreateTeamDialogOpen}
      />
    </div>
  );
}

type TeamCardProps = {
  team: Team;
  accountProfilePictureMap: Map<string, string | undefined>;
};

function TeamCard({ team, accountProfilePictureMap }: TeamCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    value: isEditDialogOpen,
    setTrue: openEditDialog,
    setValue: setEditDialogOpen,
  } = useBoolean(false);

  const collaboratorCount = team.members.length;
  const displayedMembers = team.members.slice(0, 3);
  const extraMembers = Math.max(collaboratorCount - displayedMembers.length, 0);

  const currentUserRole = team.members.find(
    (member) => member.accountId === user?.id,
  )?.teamRole;
  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  function handleCardClick() {
    navigate({
      to: '/contributor/$teamId/courses',
      params: { teamId: team.id },
    });
  }

  function handleManageClick(e: React.MouseEvent) {
    e.stopPropagation();
    openEditDialog();
  }

  return (
    <>
      <div
        className="h-full w-full cursor-pointer text-left"
        onClick={handleCardClick}
      >
        <article className="group relative flex h-full min-h-40 flex-col justify-between rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition-colors duration-150 hover:border-slate-400">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                {team.name}
              </h3>
              <div className="flex items-center gap-2">
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleManageClick}
                    className="h-7 w-7 text-slate-400 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Settings className="size-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-5 text-slate-600">
              {team.description?.trim() || 'No description yet.'}
            </p>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="flex -space-x-2">
              {displayedMembers.map((member) => (
                <TeamMemberAvatar
                  key={member.id}
                  member={member}
                  profilePictureUrl={accountProfilePictureMap.get(
                    member.accountId,
                  )}
                  fallbackText={getInitials(member.username)}
                  className="h-7 w-7 border-2 border-white text-[10px]"
                />
              ))}
              {extraMembers > 0 && (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-[10px] font-semibold text-white">
                  +{extraMembers}
                </span>
              )}
            </div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {collaboratorCount} collaborator
              {collaboratorCount === 1 ? '' : 's'}
            </span>
          </div>
        </article>
      </div>
      <EditTeamDialog
        isOpen={isEditDialogOpen}
        setDialogOpen={setEditDialogOpen}
        team={team}
      />
    </>
  );
}

function CreateTeamCard({ onInteract }: { onInteract: () => void }) {
  return (
    <button
      type="button"
      className="h-full w-full text-left"
      onClick={onInteract}
    >
      <article className="group flex h-full min-h-40 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center transition-colors duration-150 hover:border-slate-400">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors group-hover:text-sky-700">
          <Plus className="size-7 leading-none" />
        </span>
        <div className="space-y-0">
          <h3 className="text-base font-bold text-slate-900">Add New Team</h3>
          <p className="text-xs text-slate-600">Create a workspace</p>
        </div>
      </article>
    </button>
  );
}

function LoadingTeamCard() {
  return (
    <div className="h-full min-h-40 animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 h-6 w-2/3 rounded bg-slate-200" />
      <div className="mb-2 h-3.5 w-full rounded bg-slate-200" />
      <div className="mb-5 h-3.5 w-4/5 rounded bg-slate-200" />
      <div className="h-6 w-1/3 rounded-full bg-slate-200" />
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
