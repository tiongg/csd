import { Button } from '@/components/ui/button';
import {
  CardWithDetails,
  CardWithPlusIcon,
} from '@/components/ui/custom-cards';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Heading1 } from '@/components/ui/typography';
import type { components } from '@/generated/api';
import { apiQueryOptions, useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { capitalizeFirst, cn, type Course, type Team } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useBoolean } from 'usehooks-ts';
import { useState } from 'react';
import CreateCourseDialog from './CreateCourseDialog';
import TeamCollaboratorsDialog from './TeamCollaboratorsDialog';

type StatusType = 'approved' | 'pending';

type CourseListProps = {
  team: Team;
};

export default function CoursesList({ team }: CourseListProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const navigate = useNavigate();

  const { data: courses } = useApiQuery('get', '/api/teams/{teamId}/courses', {
    params: { path: { teamId: team.id } },
  });

  const {
    value: isCreateCourseDialogOpen,
    setValue: setIsCreateCourseDialogOpen,
    setTrue: openCreateCourseDialog,
  } = useBoolean(false);

  const {
    value: isTeamCollaboratorsDialogOpen,
    setValue: setIsTeamCollaboratorsDialogOpen,
    setTrue: openTeamCollaboratorsDialog,
  } = useBoolean(false);

  const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false);

  const { mutate: deleteTeam, isPending: isDeletingTeam } = useApiMutation(
    'delete',
    '/api/teams/{teamId}',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/teams/').queryKey,
        });
        toast.success('Team deleted successfully');
        navigate({ to: '/contributor/teams' });
      },
      onError: (err) => {
        toast.error((err as any)?.message || 'Failed to delete team');
      },
    },
  );

  return (
    <div className="flex h-full w-full flex-col p-8">
      <div className="flex justify-between">
        <div>
          <Heading1>{team.name}</Heading1>
          <p className="font-subtitle">Collaborators: {team.members.length}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            className="cursor-pointer gap-2 rounded-full"
            onClick={() => setIsDeleteTeamDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete Team
          </Button>
          <Button
            className="cursor-pointer gap-2 rounded-full"
            onClick={openTeamCollaboratorsDialog}
          >
            <Users className="size-4" />
            Collaborators
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 justify-start gap-4 py-4">
        <CardWithPlusIcon
          title="Create New Course"
          onClick={openCreateCourseDialog}
        />

        {(courses ?? []).map((course, i) => (
          <CourseCard course={course} teamId={team.id} key={i} />
        ))}
      </div>

      <CreateCourseDialog
        team={team}
        isOpen={isCreateCourseDialogOpen}
        setDialogOpen={setIsCreateCourseDialogOpen}
      />

      <TeamCollaboratorsDialog
        team={team}
        isOpen={isTeamCollaboratorsDialogOpen}
        setDialogOpen={setIsTeamCollaboratorsDialogOpen}
      />

      <Dialog
        open={isDeleteTeamDialogOpen}
        onOpenChange={setIsDeleteTeamDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{team.name}"? This action cannot
              be undone and will also delete all courses in this team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteTeamDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTeam({ params: { path: { teamId: team.id } } })
              }
              disabled={isDeletingTeam}
            >
              {isDeletingTeam ? 'Deleting...' : 'Delete Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Course Card ─────────────────────────────────────────────────────────────

type CourseCardProps = {
  course: Course;
  teamId: string;
  status?: StatusType;
};

const BADGE_STYLES = {
  approved: 'bg-slate-800',
  pending: 'bg-amber-500',
} satisfies Record<StatusType, string>;

function CourseCard({ course, teamId, status }: CourseCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: deleteCourse, isPending: isDeleting } = useApiMutation(
    'delete',
    '/api/courses/{id}',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/teams/{teamId}/courses', {
            params: { path: { teamId } },
          }).queryKey,
        });
        toast.success('Course deleted successfully');
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        toast.error((err as any)?.message || 'Failed to delete course');
      },
    },
  );

  const handleDelete = () => {
    deleteCourse({
      params: { path: { id: course.id } },
    });
  };

  return (
    <div className="relative">
      {status && (
        <div
          className={cn(
            'absolute top-4 right-4 w-26 rounded-full px-2 py-1 text-center text-white',
            BADGE_STYLES[status],
          )}
        >
          {capitalizeFirst(status)}
        </div>
      )}
      <CardWithDetails
        title={course.title}
        descriptor="Last Edited"
        data={dayjs(course.updatedAt).fromNow()}
        enableTooltip
        onClick={() =>
          navigate({
            to: '/contributor/editor/$courseId',
            params: { courseId: course.id },
          })
        }
      >
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteDialogOpen(true);
          }}
        >
          Delete
        </DropdownMenuItem>
      </CardWithDetails>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{course.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}