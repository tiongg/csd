import {
  CardWithDetails,
  CardWithPlusIcon,
} from '@/components/ui/custom-cards';
import { Heading1 } from '@/components/ui/typography';
import { useApiQuery } from '@/lib/fetch-client';
import type { Team } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { useBoolean } from 'usehooks-ts';
import CreateNewTeamDialog from './CreateNewTeamDialog';

export default function TeamsList() {
  const { data: teams, isLoading } = useApiQuery('get', '/api/teams/');

  const {
    value: isCreateTeamDialogOpen,
    setTrue: openCreateTeamDialog,
    setValue: setCreateTeamDialogOpen,
  } = useBoolean(false);

  return (
    <div className="flex h-full w-full flex-col p-8">
      <div>
        <Heading1>Your Teams</Heading1>
        <p className="font-subtitle">Here's what's happening today!</p>
      </div>
      <div className="grid grid-cols-4 justify-start gap-4 py-4">
        <CardWithPlusIcon
          title="Add New Team"
          onInteract={openCreateTeamDialog}
        />

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          (teams ?? []).map((team) => <TeamCard team={team} key={team.id} />)
        )}
      </div>

      <CreateNewTeamDialog
        isOpen={isCreateTeamDialogOpen}
        setDialogOpen={setCreateTeamDialogOpen}
      />
    </div>
  );
}

type TeamCardProps = {
  team: Team;
};

function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate();

  const collaboratorCount = team.members.length;

  return (
    <CardWithDetails
      title={team.name}
      descriptor="Collaborators"
      data={collaboratorCount.toString()}
      onClick={() => {
        navigate({
          to: '/contributor/$teamId/courses',
          params: { teamId: team.id },
        });
      }}
    />
  );
}
