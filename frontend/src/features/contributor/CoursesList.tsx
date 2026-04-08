import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SearchBar from '@/components/ui/searchbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useMemo, useState } from 'react';
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
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('__all__');
  const [sortOption, setSortOption] = useState<
    'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc'
  >('updated-desc');

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
  const courseList = courses ?? [];
  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(courseList.map((course) => course.category)))
        .filter((category): category is string => Boolean(category))
        .sort((a, b) => a.localeCompare(b)),
    [courseList],
  );
  const filteredCourses = useMemo(() => {
    const query = courseSearchQuery.trim().toLowerCase();
    const matched = courseList.filter((course) => {
      const searchableText = [
        course.title,
        course.description ?? '',
        course.category ?? '',
        ...(course.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);
      const matchesCategory =
        categoryFilter === '__all__' || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return [...matched].sort((a, b) => {
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      }
      if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title, undefined, { sensitivity: 'base' });
      }
      const aTime = dayjs(a.updatedAt).valueOf();
      const bTime = dayjs(b.updatedAt).valueOf();
      return sortOption === 'updated-asc' ? aTime - bTime : bTime - aTime;
    });
  }, [categoryFilter, courseList, courseSearchQuery, sortOption]);

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
            className="h-9 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
            onClick={openCreateCourseDialog}
          >
            <Plus className="size-4" />
            Create Course
          </Button>
          <Button
            className="h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={openTeamCollaboratorsDialog}
          >
            Team Members
          </Button>
          <Button
            variant="destructive"
            className="h-9 rounded-lg hover:bg-red-700"
            onClick={() => setIsDeleteTeamDialogOpen(true)}
          >
            Delete Team
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search title, tags, category"
            className="h-9 rounded-lg border-slate-300 bg-white/90"
            onSearch={setCourseSearchQuery}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[190px] rounded-lg border-slate-300 bg-white/90">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="__all__">All categories</SelectItem>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortOption}
          onValueChange={(value) =>
            setSortOption(
              value as 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc',
            )
          }
        >
          <SelectTrigger className="h-9 w-[170px] rounded-lg border-slate-300 bg-white/90">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="updated-desc">Newest</SelectItem>
            <SelectItem value="updated-asc">Oldest</SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">

        {isCoursesLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
            <LoadingCourseCard key={idx} />
          ))
          : filteredCourses.length > 0
            ? filteredCourses.map((course) => (
              <CourseCard course={course} teamId={team.id} key={course.id} />
            ))
            : (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-600">
                No courses match the current search or filters.
              </div>
            )}
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
  const tags = course.tags ?? [];
  const visibleTags = tags.slice(0, 4);
  const hiddenTagsCount = tags.length - visibleTags.length;
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
                <div className="flex-1">
                  <div className="mb-1.5">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {course.category}
                    </span>
                  </div>
                  <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                    {course.title}
                  </h3>
                </div>
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
                {tags.length > 0 ? (
                  <div className="mt-2 flex min-h-8 items-center gap-2 overflow-hidden">
                    {visibleTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex max-w-[120px] shrink-0 items-center truncate rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                        title={tag}
                      >
                        {tag}
                      </span>
                    ))}
                    {hiddenTagsCount > 0 && (
                      <span className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        +{hiddenTagsCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="mt-2 inline-flex min-h-8 items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
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
