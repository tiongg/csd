import { Button } from '@/components/ui/button';
import {
  CardWithDetails,
  CardWithPlusIcon,
} from '@/components/ui/custom-cards';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Heading1 } from '@/components/ui/typography';
import { useApiQuery } from '@/lib/fetch-client';
import { capitalizeFirst, cn, type Course, type Team } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useBoolean } from 'usehooks-ts';
import CreateCourseDialog from './CreateCourseDialog';

type StatusType = 'approved' | 'pending';

type CourseListProps = {
  team: Team;
};

export default function CoursesList({ team }: CourseListProps) {
  const { data: courses } = useApiQuery('get', '/api/teams/{teamId}/courses', {
    params: {
      path: {
        teamId: team.id,
      },
    },
  });

  const {
    value: isCreateCourseDialogOpen,
    setValue: setIsCreateCourseDialogOpen,
    setTrue: openCreateCourseDialog,
  } = useBoolean(false);

  return (
    <div className="flex h-full w-full flex-col gap-y-2 p-8">
      <div className="flex justify-between">
        <div>
          <Heading1>{team.name}</Heading1>
          <p className="font-subtitle">Collaborators: {team.members.length}</p>
        </div>

        <div>
          <Button size="lg" className="cursor-pointer">
            Collaborators
          </Button>
        </div>
      </div>
      <div>
        <Button variant="destructive" className="cursor-pointer rounded-full">
          Delete Team
        </Button>
      </div>
      <div className="grid grid-cols-4 justify-start gap-4 py-4">
        <CardWithPlusIcon
          title="Create New Course"
          onClick={openCreateCourseDialog}
        />

        {(courses ?? []).map((course, i) => (
          <CourseCard course={course} key={i} />
        ))}
      </div>

      <CreateCourseDialog
        team={team}
        isOpen={isCreateCourseDialogOpen}
        setDialogOpen={setIsCreateCourseDialogOpen}
      />
    </div>
  );
}

type CourseCardProps = {
  course: Course;
  status?: StatusType;
};

const BADGE_STYLES = {
  approved: 'bg-slate-800',
  pending: 'bg-amber-500',
} satisfies Record<StatusType, string>;

function CourseCard({ course, status }: CourseCardProps) {
  const navigate = useNavigate();

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
        onClick={() =>
          navigate({
            to: '/contributor/editor/$courseId',
            params: { courseId: course.id },
          })
        }
      >
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </CardWithDetails>
    </div>
  );
}
