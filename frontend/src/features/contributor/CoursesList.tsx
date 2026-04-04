import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heading1 } from '@/components/ui/typography';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import type { Course, Team } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useBoolean } from 'usehooks-ts';
import CreateCourseDialog from './CreateCourseDialog';
import EditCourseDialog from './EditCourseDialog';
import TeamCollaboratorsDialog from './TeamCollaboratorsDialog';

type CourseListProps = {
  team: Team;
};

export default function CoursesList({ team }: CourseListProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: courses, isLoading: isCoursesLoading } = useApiQuery(
    'get',
    '/api/teams/{teamId}/courses',
    {
      params: { path: { teamId: team.id } },
    },
  );

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
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Team Workspace
          </p>
          <Heading1 className="bg-none text-4xl leading-tight tracking-tight">
            {team.name}
          </Heading1>
          <p className="font-subtitle text-slate-600">
            Collaborators: {team.members.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="h-9 cursor-pointer rounded-lg border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            onClick={openTeamCollaboratorsDialog}
          >
            Team Members
          </Button>
          <Button
            variant="outline"
            className="h-9 cursor-pointer rounded-lg border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
            onClick={() => setIsDeleteTeamDialogOpen(true)}
          >
            Delete Team
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CreateCourseCard onInteract={openCreateCourseDialog} />

        {isCoursesLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <LoadingCourseCard key={idx} />
            ))
          : (courses ?? []).map((course) => (
              <CourseCard course={course} teamId={team.id} key={course.id} />
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

type CourseCardProps = {
  course: Course;
  teamId: string;
};

function CourseCard({ course, teamId }: CourseCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {
    value: isEditDialogOpen,
    setTrue: openEditDialog,
    setValue: setEditDialogOpen,
  } = useBoolean(false);

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

  function handleCardClick() {
    navigate({
      to: '/contributor/editor/$courseId',
      params: { courseId: course.id },
      search: { section: undefined },
    });
  }

  function handleManageClick(e: React.MouseEvent) {
    e.stopPropagation();
    openEditDialog();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        className="h-full w-full cursor-pointer text-left"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
      >
        <article className="group flex h-full min-h-40 flex-col justify-between rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
          <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-slate-200">
            {course.imageUrl ? (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
                No thumbnail
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                  {course.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleManageClick}
                    className="h-7 w-7 text-slate-400 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Settings className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                {course.description?.trim() || 'No description yet.'}
              </p>
              <div>
                {(course.tags ?? []).length > 0 ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {(course.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                    No tags
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {dayjs(course.updatedAt).fromNow()}
                </span>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
                aria-label={`Delete ${course.title}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </article>
      </div>

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

      <EditCourseDialog
        isOpen={isEditDialogOpen}
        setDialogOpen={setEditDialogOpen}
        course={course}
        teamId={teamId}
      />
    </div>
  );
}

function CreateCourseCard({ onInteract }: { onInteract: () => void }) {
  return (
    <button
      type="button"
      className="h-full w-full cursor-pointer text-left"
      onClick={onInteract}
    >
      <article className="group flex h-full min-h-40 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50/30">
        <span className="inline-flex size-16 items-center justify-center rounded-lg text-slate-700 transition-colors group-hover:text-sky-700">
          <Plus className="size-8" />
        </span>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Create New Course
          </h3>
          <p className="text-sm text-slate-600">Add a new course</p>
        </div>
      </article>
    </button>
  );
}

function LoadingCourseCard() {
  return (
    <div className="h-full min-h-40 animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 h-6 w-2/3 rounded bg-slate-200" />
      <div className="mb-2 h-3.5 w-full rounded bg-slate-200" />
      <div className="mb-5 h-3.5 w-4/5 rounded bg-slate-200" />
      <div className="h-6 w-1/3 rounded-full bg-slate-200" />
    </div>
  );
}
